export default {
    init(deps) {
        this.fs = deps.fs;
        this.path = deps.path;
        this.JSZip = deps.JSZip;

        this.walk = this.walk.bind(this);
        this.buildZipData = this.buildZipData.bind(this);
        this.bundle = this.bundle.bind(this);
        
        return this;
    },

    zip(connectorName) {
        const { buildZipData, bundle, path } = this;
        const { resolve } = path;

        const connectorPath = `${resolve(connectorName)}/`;

        try {
            const zipData = buildZipData(connectorPath);
            return bundle(connectorPath, zipData)
                .catch(err => Promise.reject(err));
        } catch(err) {
            return Promise.reject(err);
        }
    },

    buildZipData(connectorPath) {
        const { walk, JSZip, fs } = this;
        const { createReadStream } = fs;

        const fileList = walk(connectorPath);
        const zip = new JSZip();

        let fileName;
        let content;

        fileList.forEach(file => {
            fileName = file.substring(connectorPath.length, file.length);
            content = createReadStream(file);
            zip.file(fileName, content);
        });

        return zip;
    },

    bundle(connectorPath, data) {
        const { fs } = this;
        const { writeFileSync } = fs;
        const nameStart = connectorPath.lastIndexOf('\\');
        const bundleName = connectorPath.substring(nameStart + 1, connectorPath.length - 1);

        return data
            .generateAsync({ type: 'nodebuffer' })
            .then(stream => {
                writeFileSync(`${bundleName}.bizc`, stream);
            });
    },

    walk(dir, filelist) {
        const { fs, path, walk } = this;
        const { readdirSync, statSync } = fs;
        const { join } = path;

        let files = readdirSync(dir);
        filelist = filelist || [];

        files.forEach(file => {
            let isDirectory = statSync(join(dir, file)).isDirectory();

            if(isDirectory) {
                filelist =  walk(join(dir, file), filelist);
            } else {
                filelist.push(join(dir, file));
            }
        });

        return filelist;
    }
}