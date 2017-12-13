import { join, resolve } from 'path';
import normalize from 'normalize-path';

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

        const connectorPath = resolve(join(connectorName, '/'));

		try {
			const zipData = buildZipData(connectorPath);
			return bundle(zipData).catch((err) => Promise.reject(err));
		} catch (err) {
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

		fileList.forEach((file) => {
            fileName = process.platform === 'win32'
                ? normalize(file.substring(connectorPath.length + 1, file.length))
                : file.substring(connectorPath.length, file.length)
			content = createReadStream(file);
			zip.file(fileName, content);
		});

		return zip;
	},

	bundle(data) {
		const { fs } = this;
		const { writeFileSync } = fs;

		return data.generateAsync({ type: 'nodebuffer' }).then((stream) => {
			writeFileSync('Connector.bizc', stream);
		});
	},

	walk(dir, filelist) {
		const { fs, path, walk } = this;
		const { readdirSync, statSync } = fs;

		let files = readdirSync(dir);
		filelist = filelist || [];

		files.forEach((file) => {
			let isDirectory = statSync(join(dir, file)).isDirectory();

			if (isDirectory) {
				filelist = walk(join(dir, file), filelist);
			} else {
				filelist.push(join(dir, file));
			}
		});

		return filelist;
	}
};