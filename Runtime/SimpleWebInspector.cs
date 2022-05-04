using UnityEngine;
using System;
using System.IO;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using System.Text;
using System.Linq;
using System.Collections.Generic;
using System.Text.RegularExpressions;

namespace SimpleWebInspector
{
    public class SimpleWebInspector : MonoBehaviour
    {
        [Serializable]
        public class Object
        {
            public string name;
            public int instanceId;
            public bool hasParent;
            public int parentInstanceId;
            public List<int> childInstanceIds;
            public bool active;
            public Vector3 position;
            public Vector3 localPosition;
            public Vector3 rotation;
            public Vector3 localRotation;
            public Vector3 localScale;
        }

        [Serializable]
        public class TransformElement
        {
            public int instanceId;
            public string name;
            public string coordinate;
            public float value;
        }

        [Serializable]
        public class RequestPostObject
        {
            public string name;
            public string prefabPath;
            public string primitiveType;
            public bool hasParent;
            public int parentInstanceId;
            public bool instantiateInWorldSpace;
        }

        [Serializable]
        public class ResponseObjects
        {
            public List<Object> objects;
        }

        [Serializable]
        public class RequestPutObjectTransform
        {
            public List<TransformElement> transforms;
        }

        static private readonly Dictionary<string, string> ExtensionContentTypeDict = new Dictionary<string, string>() {
            {".html", "text/html"},
            {".js", "text/javascript"},
            {".css", "text/css"},
            {".json", "application/json"},
        };
        
        static private readonly string RelativeUrlRoot = "/";
        static private readonly string ZipFileName = "SWInspector-StreamingAssets.zip";

        [SerializeField]
        private string[] Prefixes = new string[] { "http://*:8080/" };

        private HttpListener httpListener;
        async Task OnEnable()
        {
            this.httpListener = new HttpListener();
            foreach (var p in Prefixes)
            {
                httpListener.Prefixes.Add(p);
            }

            try
            {
                await StartServerAsync(this.httpListener);
            }
            catch (ObjectDisposedException e)
            {
                var t = typeof(HttpListener);
                if (e.ObjectName != $"{t.Namespace}.{t.Name}") {
                    Debug.LogError(e);
                }
            }
            catch (Exception e)
            {
                Debug.LogError(e);
            }
        }

        void OnDisable()
        {
            this.httpListener.Close();
        }

        private string ReadRequestBody(HttpListenerRequest req)
        {
            using (var stream = req.InputStream)
            {
                using (var reader = new System.IO.StreamReader(stream, req.ContentEncoding))
                {
                    return reader.ReadToEnd();
                }
            }
        }

        private Vector3 MakeAssignedVector3(Vector3 vector3, string coordinate, float value)
        {
            switch (coordinate.ToLower())
            {
                case "x":
                    vector3.x = value;
                    break;
                case "y":
                    vector3.y = value;
                    break;
                case "z":
                    vector3.z = value;
                    break;
            }

            return vector3;
        }

        private void AssignTransform(Transform transform, TransformElement element)
        {
            switch (element.name.ToLower())
            {
                case "position":
                    transform.position = MakeAssignedVector3(transform.position, element.coordinate, element.value);
                    break;
                case "localposition":
                    transform.localPosition = MakeAssignedVector3(transform.localPosition, element.coordinate, element.value);
                    break;
                case "rotaion":
                    transform.rotation = Quaternion.Euler(MakeAssignedVector3(transform.rotation.eulerAngles, element.coordinate, element.value));
                    break;
                case "localrotation":
                    transform.localRotation = Quaternion.Euler(MakeAssignedVector3(transform.localRotation.eulerAngles, element.coordinate, element.value));
                    break;
                case "localscale":
                    transform.localScale = MakeAssignedVector3(transform.localScale, element.coordinate, element.value);
                    break;
            }
        }

        async Task StartServerAsync(HttpListener listener, CancellationToken cancellationToken = default(CancellationToken))
        {
            var actionMap = new Dictionary<Tuple<string, Regex>, Action<HttpListenerRequest, HttpListenerResponse>>()
            {
                {Tuple.Create("GET", new Regex($@"^{RelativeUrlRoot}api/v1/gameObjects/list$")), (req, res) => {
                        res.ContentType = "application/json";

                        var responseData = new ResponseObjects() {
                            objects = new List<Object>()
                        };
                        foreach (GameObject obj in UnityEngine.Resources.FindObjectsOfTypeAll(typeof(GameObject)))
                        {
                            AppendSceneObject(responseData.objects, obj);
                        }

                        var responseJson = Encoding.ASCII.GetBytes(JsonUtility.ToJson(responseData));
                        res.OutputStream.Write(responseJson, 0, responseJson.Length);
                        res.Close();
                    }
                },
                {Tuple.Create("POST", new Regex($@"^{RelativeUrlRoot}api/v1/gameObjects$")), (req, res) => {
                        res.ContentType = "application/json";
                        if (!req.HasEntityBody) {
                            res.StatusCode = 400;
                            res.Close();
                            return;
                        }
                        var request = JsonUtility.FromJson<RequestPostObject>(ReadRequestBody(req));
                        if (request == null) {
                            res.StatusCode = 400;
                            res.Close();
                            return;
                        }

                        var isPrimitive = !string.IsNullOrEmpty(request.primitiveType);
                        var isPrefab = !string.IsNullOrEmpty(request.prefabPath);
                        if (isPrimitive && isPrefab)
                        {
                            res.StatusCode = 400;
                            res.Close();
                            return;
                        }

                        GameObject parentGameObject = null;
                        if (request.hasParent)
                        {
                            parentGameObject = UnityEngine.Resources.FindObjectsOfTypeAll(typeof(GameObject))
                                .OfType<GameObject>()
                                .FirstOrDefault(x => x.GetInstanceID() == request.parentInstanceId);
                        }

                        var responseData = new ResponseObjects() {
                            objects = new List<Object>()
                        };
                        GameObject result;

                        if (isPrefab)
                        {
                            var prefab = Resources.Load(request.prefabPath);
                            if (prefab == null)
                            {
                                res.StatusCode = 204;
                                res.Close();
                                return;
                            }
                            if (parentGameObject != null)
                            {
                                result = Instantiate(prefab, parentGameObject.transform, request.instantiateInWorldSpace) as GameObject;
                            }
                            else
                            {
                                result = Instantiate(prefab) as GameObject;
                            }
                            result.name = request.name;
                        }
                        else if (isPrimitive)
                        {
                            var primitiveTypeName = request.primitiveType.ToLower();
                            var types = Enum.GetValues(typeof(PrimitiveType))
                                .OfType<PrimitiveType>()
                                .Where(x => x.ToString().ToLower() == primitiveTypeName)
                                .ToArray();
                            if (!types.Any())
                            {
                                res.StatusCode = 400;
                                res.Close();
                                return;
                            }
                            result = GameObject.CreatePrimitive(types.First());
                            if (parentGameObject != null)
                            {
                                result.transform.SetParent(parentGameObject.transform, request.instantiateInWorldSpace);
                            }
                        }
                        else
                        {
                            result = new GameObject(request.name);
                            if (parentGameObject != null)
                            {
                                result.transform.SetParent(parentGameObject.transform, request.instantiateInWorldSpace);
                            }
                        }

                        AppendSceneObject(responseData.objects, result);
                        var responseJson = Encoding.ASCII.GetBytes(JsonUtility.ToJson(responseData));
                        res.OutputStream.Write(responseJson, 0, responseJson.Length);
                        res.Close();
                    }
                },
                {Tuple.Create("PUT", new Regex($@"^{RelativeUrlRoot}api/v1/gameObjects/transforms$")), (req, res) => {
                        res.ContentType = "application/json";
                        if (!req.HasEntityBody) {
                            res.StatusCode = 400;
                            res.Close();
                            return;
                        }
                        var request = JsonUtility.FromJson<RequestPutObjectTransform>(ReadRequestBody(req));
                        if (request == null) {
                            res.StatusCode = 400;
                            res.Close();
                            return;
                        }

                        var responseData = new ResponseObjects() {
                            objects = new List<Object>()
                        };
                        var objects = (IEnumerable<GameObject>)UnityEngine.Resources.FindObjectsOfTypeAll(typeof(GameObject));
                        foreach (var t in request.transforms)
                        {
                            var obj = objects.FirstOrDefault(o => o.GetInstanceID() == t.instanceId);
                            if (obj == null)
                            {
                                continue;
                            }
                            AssignTransform(obj.transform, t);
                            if (!responseData.objects.Any(p => p.instanceId == t.instanceId)) {
                                AppendSceneObject(responseData.objects, obj);
                            }
                        }

                        var responseJson = Encoding.ASCII.GetBytes(JsonUtility.ToJson(responseData));
                        res.OutputStream.Write(responseJson, 0, responseJson.Length);
                        res.Close();
                    }
                },
                {Tuple.Create("GET", new Regex($@"^{RelativeUrlRoot}")), (req, res) => {
                        string relativePath = req.RawUrl.Remove(req.RawUrl.IndexOf(RelativeUrlRoot), RelativeUrlRoot.Length);
                        if (relativePath.Contains(".."))
                        {
                            res.StatusCode = 404;
                            res.Close();
                        }

                        if (relativePath == "") {
                            relativePath = "index.html";
                        }

                        string zipFilePath = Path.Combine(Application.streamingAssetsPath, ZipFileName);

                        byte[] content = GetBytesFromZip(zipFilePath, relativePath);
                        if (content == null)
                        {
                            res.StatusCode = 404;
                            res.Close();
                            return;
                        }

                        string contentType;
                        if (!ExtensionContentTypeDict.TryGetValue(Path.GetExtension(relativePath), out contentType))
                        {
                            contentType = ExtensionContentTypeDict[".html"];
                        }
                        res.ContentType = contentType;

                        res.OutputStream.Write(content, 0, content.Length);
                        res.Close();
                    }
                },
            };

            listener.Start();

            while (true)
            {
                var context = await listener.GetContextAsync();

                cancellationToken.ThrowIfCancellationRequested();

                var req = context.Request;
                var res = context.Response;

                var action = actionMap.FirstOrDefault(a => a.Key.Item1 == req.HttpMethod && a.Key.Item2.IsMatch(req.RawUrl));

                if (action.Value == null)
                {
                    res.StatusCode = 404;
                    res.Close();
                    continue;
                }

                action.Value(req, res);
            }

        }

        private Object MakeObject(GameObject gameObject)
        {
            var parent = gameObject.transform.parent;
            return new Object()
            {
                name = gameObject.name,
                instanceId = gameObject.GetInstanceID(),
                hasParent = parent != null,
                parentInstanceId = parent != null ? parent.GetInstanceID() : 0,
                childInstanceIds = new List<int>(),
                active = gameObject.activeSelf,
                position = gameObject.transform.position,
                localPosition = gameObject.transform.localPosition,
                rotation = gameObject.transform.rotation.eulerAngles,
                localRotation = gameObject.transform.localRotation.eulerAngles,
                localScale = gameObject.transform.localScale
            };
        }

        private Object AppendSceneObject(List<Object> objects, GameObject gameObject)
        {
            if (gameObject.scene.name == null) {
                return null;
            }

            var instanceId = gameObject.GetInstanceID();

            var existingObject = objects.FirstOrDefault(o => o.instanceId == instanceId);
            if (existingObject != null) {
                return existingObject;
            }

            var parent = gameObject.transform.parent;

            if (parent == null)
            {
                if (!gameObject.hideFlags.HasFlag(HideFlags.NotEditable) &&
                    !gameObject.hideFlags.HasFlag(HideFlags.HideAndDontSave))
                {
                    var obj = MakeObject(gameObject);
                    objects.Add(obj);
                    return obj;
                }
            }
            else
            {
                var parentId = parent.GetInstanceID();
                var p = objects.FirstOrDefault(o => o.instanceId == parentId);
                if (p == null) {
                    p = AppendSceneObject(objects, parent.gameObject);
                }
                p.childInstanceIds.Add(instanceId);

                var obj = MakeObject(gameObject);
                objects.Add(obj);
                return obj;
            }

            return null;
        }

        private const uint CentralDirectoryHeaderSize = 46;

        private static byte[] GetBytesFromZip(string zipFilePath, string contentPath)
        {
            Stream stream = null;
            WWW www = null;

            try
            {
                try
                {
                    stream = new FileStream(zipFilePath, FileMode.Open, FileAccess.Read);
                }
                catch
                {
                    www = new WWW(zipFilePath);
                    while (!www.isDone) { }
                    stream = new MemoryStream(www.bytes);
                }

                var centralDirectoryPosition = GetStartPositionOfCentralDirectory(stream);
                if (centralDirectoryPosition == 0)
                {
                    return null;
                }

                var header = new byte[CentralDirectoryHeaderSize];

                while (centralDirectoryPosition < stream.Length)
                {
                    stream.Seek(centralDirectoryPosition, SeekOrigin.Begin);

                    if (!ReadBytes(stream, header))
                    {
                        return null;
                    }

                    var fileNameLength = BitConverter.ToUInt16(header, 28);

                    var fileNameBytes = new byte[fileNameLength];
                    if (!ReadBytes(stream, fileNameBytes))
                    {
                        return null;
                    }

                    var fileName = System.Text.Encoding.ASCII.GetString(fileNameBytes);

                    if (fileName == contentPath)
                    {
                        var compressedSize = BitConverter.ToUInt32(header, 20);
                        var localFilePosition = BitConverter.ToUInt32(header, 42);

                        return GetZipLocalFile(stream, localFilePosition, fileNameLength, compressedSize);
                    }

                    var extraFieldLength = BitConverter.ToUInt16(header, 30);
                    var commentLength = BitConverter.ToUInt16(header, 32);


                    centralDirectoryPosition += (uint)header.Length + fileNameLength + extraFieldLength + commentLength;
                }

                return null;
            }
            finally
            {
                stream?.Dispose();
                www?.Dispose();
            }
        }

        private const uint EndOfCentralDirectoryHeaderSize = 22;

        private static uint GetStartPositionOfCentralDirectory(Stream stream)
        {
            var header = new byte[EndOfCentralDirectoryHeaderSize];

            long length = stream.Length;

            for (long offset = header.Length; offset <= length; offset++)
            {
                stream.Seek(-offset, SeekOrigin.End);

                ReadBytes(stream, header);

                if (BitConverter.ToUInt32(header, 0) != 0x06054b50)
                {
                    continue;
                }

                return BitConverter.ToUInt32(header, 16);
            }

            return 0;
        }

        private const uint LocalFileHeaderSize = 30;

        private static byte[] GetZipLocalFile(Stream stream, uint position, uint fileNameLength, uint compressedSize)
        {
            stream.Seek(position, SeekOrigin.Begin);

            var header = new byte[LocalFileHeaderSize];
            if (!ReadBytes(stream, header))
            {
                return null;
            }

            if (BitConverter.ToUInt32(header, 0) != 0x04034b50)
            {
                return null;
            }

            var extraFieldLength = BitConverter.ToUInt16(header, 28);

            stream.Seek(position + header.Length + fileNameLength + extraFieldLength, SeekOrigin.Begin);

            var data = new byte[compressedSize];
            if (!ReadBytes(stream, data))
            {
                return null;
            }

            return data;
        }

        private static bool ReadBytes(Stream stream, byte[] bytes)
        {
            int readSize;
            readSize = stream.Read(bytes, 0, bytes.Length);
            if (readSize != bytes.Length)
            {
                return false;
            }
            return true;
        }
    }
}