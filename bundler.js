const params = new URLSearchParams(window.location.search);

getDatapack(params.get("modules").split("..."));

async function getDatapack(datapacks) {
    const promises = datapacks.map(e => getModule(e.split("/")));
    const modules = await Promise.all(promises.reverse());
    let zip = new JSZip();
    let tags = {};
    for (const module of modules) {
        for (const file of module) {
            let content = file.content;
            if (file.path.match("data/[^/]+/tags/.+/.+\.json")) {
                const oldValues = tags[file.path];
                const newContent = JSON.parse(file.content);
                if (!oldValues || newContent.replace === true) {
                    tags[file.path] = newContent.values;
                } else {
                    let values = new Set(oldValues);
                    newContent.values.forEach(v => values.add(v));
                    values = Array.from(values);
                    content = JSON.stringify({ values }, null, 2);
                    tags[file.path] = values;
                }
            }
            zip.file(file.path, content);
        }
    }
    const content = await zip.generateAsync({ type: "blob" });
    const name = params.get("name") || datapacks[0].split("/").slice(-1);
    saveAs(content, `${name}.zip`);
}

async function getModule(datapack) {
    const repo = datapack.slice(0, 2).join("/");
    const root = datapack.slice(2);
    let sha;
    if (root.length === 0) {
        const response = await fetch(`https://api.github.com/repos/${repo}/branches/master`);
        sha = (await response.json()).commit.sha;
    } else {
        const parent = root.slice(0, -1).join("/");
        const response = await fetch(`https://api.github.com/repos/${repo}/contents/${parent}`);
        const data = await response.json();
        sha = data.find(e => e.path === root.join("/")).sha;
    }
    const response = await fetch(`https://api.github.com/repos/${repo}/git/trees/${sha}?recursive=1`);
    const tree = (await response.json()).tree;
    const files = await getTree(repo, root.join("/"), tree.filter(e => e.size !== undefined));
    return files;
}

async function getTree(repo, root, tree) {
    const promises = tree.map(e => getFile(repo, root, e.path));
    const files = await Promise.all(promises);
    return files;
}

async function getFile(repo, root, path) {
    if (root !== "") root += "/";
    const response = await fetch(`https://raw.githubusercontent.com/${repo}/master/${root}${path}`);
    const content = await response.text();
    return { path, content };
}
