Set wshShell = CreateObject("WScript.Shell")
strDesktop = wshShell.SpecialFolders("Desktop")
Set objFSO = CreateObject("Scripting.FileSystemObject")

' Get the path where the script is located
strCurrentDir = objFSO.GetParentFolderName(WScript.ScriptFullName)

' Set up paths for the batch file and the icon
strTargetFile = strCurrentDir & "\start_windows.bat"
strIconFile = strCurrentDir & "\icon.ico"

' Create the shortcut
Set oShortcut = wshShell.CreateShortcut(strDesktop & "\PulmoView.lnk")
oShortcut.TargetPath = strTargetFile
oShortcut.WorkingDirectory = strCurrentDir
oShortcut.IconLocation = strIconFile & ", 0"
oShortcut.Description = "Start the ILO RAD Suite locally"
oShortcut.Save

MsgBox "Desktop shortcut 'PulmoView' created successfully!" & vbCrLf & vbCrLf & "You can now launch the software directly from your Desktop.", 64, "Shortcut Created"

