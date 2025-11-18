Backfill residents migration

Purpose

This script copies documents from `users` where `role === 'resident'` into the `residents` collection so older signups appear in resident-management and counts.

How to run

1. Install dependencies (adds firebase-admin if not already installed):

```powershell
cd C:\Users\ctian\Desktop\BIS-TEST
npm install
```

2. Obtain a Firebase service account JSON with project-level permissions. Keep it private.

3. Run the script with PowerShell either by setting the env var or passing the path:

```powershell
# Option A: env var
$env:GOOGLE_APPLICATION_CREDENTIALS = 'C:\path\to\serviceAccount.json'
npm run backfill:residents

# Option B: pass path as argument
node .\tools\backfill-residents.js C:\path\to\serviceAccount.json
```

Notes

- The script uses server timestamps for createdAt/updatedAt in Firestore.
- It's a one-time migration. Review the output to confirm created/skipped/failed counts.
- If you prefer a browser-based admin UI for this action, I can add a "Sync residents" button in the Staff Dashboard instead.
