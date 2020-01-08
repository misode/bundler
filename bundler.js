const api = "https://api.github.com/";
const params = new URLSearchParams(window.location.search);

const datapack = params.get("d").split("/");
getDatapack(datapack);

async function getDatapack(datapack) {
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
    console.log(files);
    var zip = new JSZip();
    for (const f of files) {
        zip.file(f.path, f.content);
    }
    const content = await zip.generateAsync({ type: "blob" })
    saveAs(content, `${root.slice(-1)}.zip`);
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
