const { createReadStream, readdirSync, writeFileSync, statSync } = require('fs');
const { join, resolve } = require('path');
const normalize = require('normalize-path');

module.exports = {
	init(deps) {
		this.JSZip = deps.JSZip;

		this.walk = this.walk.bind(this);
		this.buildZipData = this.buildZipData.bind(this);
		this.bundle = this.bundle.bind(this);

		return this;
	},

	zip(connectorName) {
    const { buildZipData, bundle } = this;

		const connectorPath = resolve(join(connectorName, '/'));

		try {
			const zipData = buildZipData(connectorPath);
			return bundle(zipData).catch((err) => Promise.reject(err));
		} catch (err) {
			return Promise.reject(err);
		}
	},

	buildZipData(connectorPath) {
		const { walk, JSZip } = this;

		const fileList = walk(connectorPath);
		const zip = new JSZip();

		let fileName;
		let content;

		fileList.forEach((file) => {
			fileName =
				process.platform === 'win32'
					? normalize(file.substring(connectorPath.length + 1, file.length))
					: file.substring(connectorPath.length, file.length);
			content = createReadStream(file);
			zip.file(fileName, content);
		});

		return zip;

	},
	bundle(data) {
		return data.generateAsync({ type: 'nodebuffer' }).then((stream) => {
			writeFileSync('Connector.bizc', stream);
		});
	},

	walk(dir, filelist) {
		const { fs, path, walk } = this;

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
