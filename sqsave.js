const mysql = require('mysql');
const db = mysql.createConnection(require('./db-connect'));
const uid = 'SQUIGGLY_1abc';
const readline = require('readline');
const fs = require('fs');

const read = (query) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }))
}

const run = (cmd) => {
    const args = cmd.split(' ');

    if (args[0] == 'uid') SendUid();
    else if (args[0] == 'mk') {
        const type = args[1];
        const name = args[2];

        if (!type || !name) return console.error('Error: Missing Args');

        CreateByType(type, name);
    } else if (args[0] == 'upload') {
        const type = args[1];
        const repo = args[2];
        const location = args[3];

        if (!type || !repo || !location) return console.error('Error: Missing Args');

        UploadByType(type, repo, location);
    } else if (args[0] == 'ls') {
        const repo = args[1];

        if (!repo) return console.error('Error: Missing Args');

        GetFilesFromRepo(repo);
    } else if (args[0] == 'lsc') {
        const repo = args[1];

        if (!repo) return console.error('Error: Missing Args');

        GetFilesFromRepoWithContent(repo);
    } else if (args[0] == 'clone') {
        const repo = args[1];
        const location = args[2];

        if (!repo || !location) return console.error('Error: Missing Args');

        CloneFilesFromRepo(repo, location);
    } else if (args[0] == 'del') {
        const type = args[1];
        const name = args[2];

        if (!type || !name) return console.error('Error: Missing Args');

        DeleteByType(type, name);
    }
}

async function SendUid() {
    console.log(uid);
}

async function CreateByType(type, name) {
    var query = '';

    switch (type) {
        case 'repo':
            query = `INSERT INTO repos(uid, name) VALUES('${uid}', '${name}')`;
            break;
        default:
            return console.error('Error: Unknown Type');
    }

    db.query(query, (err) => {
        if (err) return console.error(err);
        console.log(`Success: Created a ${type} by the name of ${name}.`)
    })
}

async function UploadByType(type, repo, location) {
    if (!fs.existsSync(location)) return console.error('Error: Unknown Location');

    switch (type) {
        case 'file':
            UploadFile(repo, location);
            break;
        case 'dir':
            var files = fs.readdirSync(location);
            for (var file of files) {
                UploadFile(repo, `${location}/${file}`);
            }
            break;
        default:
            return console.error('Error: Unknown Type');
    }
}

async function GetFilesFromRepo(repo) {
    db.query(`SELECT * FROM files WHERE repo = '${repo}' AND uid = '${uid}';`, (err, results) => {
        if (err) return console.error(err);
        if (results.length == 0) return console.error(`Error: ${repo} does not have any files.`);

        console.log(`Success: Selected all from from ${repo}.`);

        for (var res of results) {
            console.log(`${res.location}`);
        }
        return;
    });
}

async function GetFilesFromRepoWithContent(repo) {
    db.query(`SELECT * FROM files WHERE repo = '${repo}' AND uid = '${uid}';`, (err, results) => {
        if (err) return console.error(err);
        if (results.length == 0) return console.error(`Error: ${repo} does not have any files.`);

        console.log(`Success: Selected all from from ${repo}.\n_____________________________`);

        for (var res of results) {
            console.log(`${res.location}:\n${res.content}\n_____________________________`);
        }
        return;
    });
}

async function CloneFilesFromRepo(repo, location) {
    db.query(`SELECT * FROM files WHERE repo = '${repo}' AND uid = '${uid}';`, (err, results) => {
        if (err) return console.error(err);

        console.log(`Success: Selected all from from ${repo}.`);
        var nLoc = `${location}/${repo}`;

        if (!fs.existsSync(nLoc)) {
            fs.mkdirSync(nLoc);
        }

        for (var res of results) {
            const folders = res.location.split('/');

            if (!fs.existsSync(`${nLoc}/${folders[0]}`)) {
                fs.mkdirSync(`${nLoc}/${folders[0]}`);
            }

            fs.writeFileSync(`${nLoc}/${res.location}`, res.content);
            console.log(`Success: Created ${nLoc}/${res.location}.`);
        }
        return;
    });
}

async function UploadFile(repo, location) {
    db.query(`SELECT * FROM files WHERE repo='${repo}' AND uid = '${uid}' AND location='${location}';`, (err, results) => {
        if (err) return console.error(err);

        var content = fs.readFileSync(location).toString().replace(/'/g, '"');

        if (results.length == 0) {
            query = `INSERT INTO files(uid, repo, location, content) 
            VALUES('${uid}', '${repo}', '${location}', '${content}')`;
        } else {
            query = `UPDATE files SET content = '${content}', location = '${location}' WHERE repo='${repo}' AND uid = '${uid}' AND location='${location}';`;
        }

        db.query(query, (err) => {
            if (err) return console.error(err);
            console.log(`Success: Uploaded ${location} to ${repo}.`)
        })
    })
}

async function DeleteByType(type, name) {
    switch (type) {
        case 'repo':
            DeleteRepo(name);
            break;
        default:
            DeleteFile(name, type);
            break;
    }

    console.log(`Success: Deleted ${name}(${type}).`);
}

async function DeleteRepo(name) {
    db.query(`DELETE FROM repos WHERE name='${name}' AND uid='${uid}'`, (err) => {
        if (err) return console.error(err);
        db.query(`DELETE FROM files WHERE repo='${name}' AND uid='${uid}'`, (err) => {
            if (err) return console.error(err);
        })
    })
}

async function DeleteFile(location, repo) {
    db.query(`DELETE FROM files WHERE repo='${repo}' AND uid='${uid}' AND location='${location}'`, (err) => {
        if (err) return console.error(err);
    })
}

async function main() {
    console.log('Welcome to SQSave!');
    while (true) {
        const cmd = await read('> ');
        if (cmd == 'quit') break;

        run(cmd);
    }
    const randGoodbye = require('./goodbye-messages');
    const randGoodbyeMessage = randGoodbye[Math.floor(Math.random() * randGoodbye.length)];

    console.log(randGoodbyeMessage);
}

main().catch(err => console.error(err));