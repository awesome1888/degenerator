import nanoid from 'nanoid';
// import os from 'os';
import path from 'path';
import pathExists from 'path-exists';
// import ncp from 'ncp';
import del from 'del';
// import { promisify } from 'util';
import { ReferenceParseResult } from './type';
import { GIT } from './git';
import { NPM } from './npm';
import { GeneratorRecord } from './generator-record';
import { GeneratorList } from './generator-list';
import { absolutizePath } from './util';

export class GeneratorManager {
    constructor(private generatorsPath = '') {}

    public async add(reference: ReferenceParseResult) {
        const id = `gen-${nanoid()}`;

        if (!(await GIT.isAvailable())) {
            throw new Error('Git is not installed');
        }

        // const tmpDir = os.tmpdir();
        // const localPath = path.join(tmpDir, id);
        // const localGeneratorPath = path.join(localPath, reference.path);
        const finalRepositoryPath = path.join(this.generatorsPath, id);
        const finalGeneratorPath = path.join(
            finalRepositoryPath,
            reference.path,
        );

        await GIT.clone(reference.repository, this.generatorsPath, id);
        await GIT.checkout(finalRepositoryPath, reference.branch);

        if (!(await pathExists(finalGeneratorPath))) {
            await this.rmGeneratorById(id);
            throw new Error(
                `Path "${reference.path}" was not found in the repository`,
            );
        }

        // const copy = promisify(ncp.ncp);
        // await copy(localPath, finalRepositoryPath);
        if (await NPM.isAvailable()) {
            await NPM.install(finalGeneratorPath);
        }

        const generatorItem = await GeneratorList.getGeneratorItem(
            absolutizePath(finalGeneratorPath),
        );
        if (!generatorItem) {
            await this.rmGeneratorById(id);
            throw new Error(
                'Having hard times importing an index file of the generator. Use -d option to see the error.',
            );
        }

        const recordManager = new GeneratorRecord(this.generatorsPath);
        await recordManager.addGenerator(id, reference);
    }

    public async update(query: string) {
        const recordManager = new GeneratorRecord(this.generatorsPath);
        const record = await recordManager.get(query);

        // eslint-disable-next-line no-restricted-syntax
        for (const generator of record.generators) {
            const finalRepositoryPath = path.join(
                this.generatorsPath,
                generator.id,
            );
            // eslint-disable-next-line no-await-in-loop
            await GIT.pull(finalRepositoryPath, generator.branch);

            // eslint-disable-next-line no-await-in-loop
            if (await NPM.isAvailable()) {
                // eslint-disable-next-line no-await-in-loop
                await NPM.install(
                    path.join(finalRepositoryPath, generator.path),
                );
            }
        }
    }

    public async remove(query: string) {
        const recordManager = new GeneratorRecord(this.generatorsPath);
        const record = await recordManager.get(query);

        if (record.generators.length) {
            // kill em all
            // eslint-disable-next-line no-restricted-syntax
            for (const generator of record.generators) {
                // eslint-disable-next-line no-await-in-loop
                await this.rmGeneratorById(generator.id);
            }

            await recordManager.removeGenerators(query);
        }
    }

    public async getList(query?: string) {
        const recordManager = new GeneratorRecord(this.generatorsPath);
        return recordManager.get(query);
    }

    public async getFolderList() {
        const list = await this.getList();
        return list.generators.map(item =>
            path.join(this.generatorsPath, item.id, item.path),
        );
    }

    private async rmGeneratorById(id: string) {
        return del([path.join(this.generatorsPath, id)], {
            force: true,
        });
    }
}