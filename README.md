# SqSave
### A command line github alternative I made for fun.
------------
#### To Try it out:

1.  Run `git clone https://github.com/AwsomeWorkDevoloper/SqSave.git` in your desired location
2. Import the database using a MySQL server like PHPMyAdmin
3. Run `npm install`
5. Create a file called `db-connect.js` that looks something like 
`module.exports = {
    host: 'localhost',
    password: '',
    user: 'root',
    database: 'sqsave'
};`
4. Run `SqSave.bat` and there you go!


__________
#### Commands:
- `uid`: Returns the current User id
- `mk repo <name>`: Creates a repository
- `upload <type> <repo> <location>`:  Uploads a **(type: `file` or `dir`)** to a repository
- `ls <repo>`: Returns all the names of files in a repository
- `lsc <repo>`: Return all the files with the content in a repository
- `clone <repo> <location>`: Downloads a repository to a folder
- `del repo <repo name>`: Deletes a repository
- `del <repo name> <file name>`: Deletes a file from a repository

_________
