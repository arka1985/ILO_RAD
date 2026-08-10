Set WshShell = CreateObject("WScript.Shell")
' Run the Next.js server silently in the background
WshShell.Run "cmd /c npx next start", 0, False

' Wait 3 seconds for the server to spin up
WScript.Sleep 3000

' Open the default browser to the app
WshShell.Run "http://localhost:3000"
