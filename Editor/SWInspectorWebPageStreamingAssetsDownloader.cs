using System;
using System.IO;
using System.Runtime.CompilerServices;
using System.Text.RegularExpressions;
using UnityEditor;
using UnityEngine;
using UnityEngine.Networking;

namespace SimpleWebInspector.Editor
{
    public static class SWInspectorWebPageStreamingAssetsInstaller
    {
        private const string PackageJsonGuid = "bae798a5cd3c54eab950a52d834400e9";

        private const string DownloadUrl = "https://github.com/r01hee/SimpleWebInspector/releases/download/v{0}/SWInspector-StreamingAssets.zip";

        private static readonly Regex VersionRegex = new Regex(@"""version""\s*:\s*""(\d+.\d.\d)""");

        [MenuItem("Window/SimpleWebInspector/Download WebPage StreamingAssets")]
        public static async void DownloadSWInspectorWebPageStreamingAssets()
        {
            try
            {
                var needToSelectFolder = !EditorUtility.DisplayDialog("Download StreamingAssets to \"Assets/StreamingAssets\" folder", string.Empty, "OK", "Select other folder");
                var path = Path.GetFullPath(Path.Combine("Assets", "StreamingAssets"));
                while (needToSelectFolder)
                {
                    path = EditorUtility.SaveFolderPanel("Select StreamingAssets Folder", "Assets", "StreamingAssets");
                    if (path == null)
                    {
                        return;
                    }
                    if (Path.GetFileName(path) != "StreamingAssets")
                    {
                        needToSelectFolder = EditorUtility.DisplayDialog("This assets should be located in StreamingAssets", $"You selected \"{path}\".\nIt may not work, OK?", "Select other folder, again", "OK, I understand");
                    }
                    else
                    {
                        needToSelectFolder = false;
                    }
                }
                var directoryInfo = new DirectoryInfo(path);
                if (!directoryInfo.Exists)
                {
                    directoryInfo.Create();
                }
                var filePath = Path.Combine(directoryInfo.FullName, Path.GetFileName(DownloadUrl));

                var packageJsonPath = FindAssetByGuid(PackageJsonGuid);
                if (packageJsonPath == null)
                {
                    EditorUtility.DisplayDialog("Error", "not found package.json in Simple Web Inspector package", "OK");
                    return;
                }

                string version;
                using (var stream = File.OpenText(packageJsonPath))
                {
                    var json = await stream.ReadToEndAsync();
                    var m = VersionRegex.Match(json);
                    if (!m.Success)
                    {
                        EditorUtility.DisplayDialog("Error", "not found version info in package.json", "OK");
                        return;
                    }
                    version = m.Groups[1].Value;
                }

                var url = string.Format(DownloadUrl, version);
                using (var request = UnityWebRequest.Get(url))
                {
                    await new AwaitableUnityWebRequestAsyncOperation(request.SendWebRequest());
                    if (request.result != UnityWebRequest.Result.Success)
                    {
                        EditorUtility.DisplayDialog($"Download Error({url})", $"{request.error}", "OK");
                        return;
                    }

                    using (var stream = File.OpenWrite(filePath))
                    {
                        var data = request.downloadHandler.data;
                        await stream.WriteAsync(data, 0, data.Length);
                    }
                }

                AssetDatabase.Refresh();
                EditorUtility.DisplayDialog("Downloaded SWInspector StreamingAssets", $"saved to \"{filePath}\"", "OK");
            }
            catch (Exception ex)
            {
                EditorUtility.DisplayDialog("Error", ex.Message, "OK");
                throw;
            }
        }

        private static string FindAssetByGuid(string guid)
        {
            var pathByAssetDatabase = AssetDatabase.GUIDToAssetPath(guid);
            var fi = new FileInfo(pathByAssetDatabase);
            return fi.Exists ? fi.FullName : null;
        }

        private class AwaitableUnityWebRequestAsyncOperation
        {
            private UnityWebRequestAsyncOperation asyncOp;

            public AwaitableUnityWebRequestAsyncOperation(UnityWebRequestAsyncOperation asyncOp)
            {
                this.asyncOp = asyncOp;
            }

            public Awaiter GetAwaiter()
            {
                return new Awaiter(asyncOp);
            }

            public class Awaiter : INotifyCompletion
            {
                private UnityWebRequestAsyncOperation asyncOp;
                private Action continuation;

                public Awaiter(UnityWebRequestAsyncOperation asyncOp)
                {
                    this.asyncOp = asyncOp;
                    asyncOp.completed += OnRequestCompleted;
                }

                public bool IsCompleted { get { return asyncOp.isDone; } }

                public void GetResult() { }

                public void OnCompleted(Action continuation)
                {
                    this.continuation = continuation;
                }

                private void OnRequestCompleted(AsyncOperation obj)
                {
                    continuation();
                }
            }

        }
    }
}