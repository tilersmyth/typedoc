import { Application } from '..';
import * as Path from 'path';
import Assert = require('assert');
import './.dot';
import { Converter, Context } from '../lib/converter';

describe('TypeDoc', function() {
    let application: Application;

    describe('Application', function() {
        before('constructs', function() {
            application = new Application();
        });
        it('expands input directory', function() {
            const inputFiles = Path.join(__dirname, 'converter', 'class');
            const expanded = application.expandInputFiles([inputFiles]);

            Assert.notEqual(expanded.indexOf(Path.join(inputFiles, 'class.ts')), -1);
            Assert.equal(expanded.indexOf(inputFiles), -1);
        });
        it('expands input files', function() {
            const inputFiles = Path.join(__dirname, 'converter', 'class', 'class.ts');
            const expanded = application.expandInputFiles([inputFiles]);

            Assert.notEqual(expanded.indexOf(inputFiles), -1);
        });
        it('honors the exclude argument even on a fixed directory list', function() {
            const inputFiles = Path.join(__dirname, 'converter', 'class');
            application.options.setValue('exclude', '**/class.ts');
            const expanded = application.expandInputFiles([inputFiles]);

            Assert.equal(expanded.indexOf(Path.join(inputFiles, 'class.ts')), -1);
            Assert.equal(expanded.indexOf(inputFiles), -1);
        });
        it('honors the exclude argument even on a fixed file list', function() {
            const inputFiles = Path.join(__dirname, 'converter', 'class', 'class.ts');
            application.options.setValue('exclude', '**/class.ts');
            const expanded = application.expandInputFiles([inputFiles]);

            Assert.equal(expanded.indexOf(inputFiles), -1);
        });
        it('supports multiple excludes', function() {
            const inputFiles = Path.join(__dirname, 'converter');
            application.options.setValue('exclude', '**/+(class|access).ts');
            const expanded = application.expandInputFiles([inputFiles]);

            Assert.equal(expanded.indexOf(Path.join(inputFiles, 'class', 'class.ts')), -1);
            Assert.equal(expanded.indexOf(Path.join(inputFiles, 'access', 'access.ts')), -1);
            Assert.equal(expanded.indexOf(inputFiles), -1);
        });
        it('supports array of excludes', function() {
            const inputFiles = Path.join(__dirname, 'converter');
            application.options.setValue('exclude', [ '**/class.ts', '**/access.ts' ]);
            const expanded = application.expandInputFiles([inputFiles]);

            Assert.equal(expanded.indexOf(Path.join(inputFiles, 'class', 'class.ts')), -1);
            Assert.equal(expanded.indexOf(Path.join(inputFiles, 'access', 'access.ts')), -1);
            Assert.equal(expanded.indexOf(inputFiles), -1);
        });
        it('supports excluding directories beginning with dots', function() {
            const inputFiles = __dirname;
            application.options.setValue('exclude', '**/+(.dot)/**');
            const expanded = application.expandInputFiles([inputFiles]);

            Assert.equal(expanded.indexOf(Path.join(inputFiles, '.dot', 'index.d.ts')), -1);
            Assert.equal(expanded.indexOf(inputFiles), -1);
        });
        it('Honors the exclude option even if a module is imported', () => {
            application.options.setValue('exclude', '**/b.d.ts');

            function handler(context: Context) {
                Assert.deepStrictEqual(context.fileNames, [
                    Path.resolve(__dirname, 'module', 'a.d.ts').replace(/\\/g, '/')
                ]);
            }
            application.converter.on(Converter.EVENT_END, handler);
            application.convert([ Path.join(__dirname, 'module', 'a.d.ts')]);
            application.converter.off(Converter.EVENT_END, handler);
        });
    });
});
