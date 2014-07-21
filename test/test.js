var path = require('path');
var expect = require('expect.js');
var uptJson = require('../lib/json');

describe('.find', function () {
    it('should find the upt.json file', function (done) {
        uptJson.find(__dirname + '/pkg-upt-json', function (err, file) {
            if (err) {
                return done(err);
            }

            expect(file).to.equal(path.resolve(__dirname + '/pkg-upt-json/upt.json'));
            done();
        });
    });

    it('should fallback to the component.json file', function (done) {
        uptJson.find(__dirname + '/pkg-component-json', function (err, file) {
            if (err) {
                return done(err);
            }

            expect(file).to.equal(path.resolve(__dirname + '/pkg-component-json/component.json'));
            done();
        });
    });

    it('should not fallback to the component.json file if it\'s a component(1) file', function (done) {
        uptJson.find(__dirname + '/pkg-component(1)-json', function (err) {
            expect(err).to.be.an(Error);
            expect(err.code).to.equal('ENOENT');
            expect(err.message).to.equal('None of upt.json, component.json, .upt.json were found in ' + __dirname + '/pkg-component(1)-json');
            done();
        });
    });

    it('should fallback to the .upt.json file', function (done) {
        uptJson.find(__dirname + '/pkg-dot-upt-json', function (err, file) {
            if (err) {
                return done(err);
            }

            expect(file).to.equal(path.resolve(__dirname + '/pkg-dot-upt-json/.upt.json'));
            done();
        });
    });

    it('should error if no component.json / upt.json / .upt.json is found', function (done) {
        uptJson.find(__dirname, function (err) {
            expect(err).to.be.an(Error);
            expect(err.code).to.equal('ENOENT');
            expect(err.message).to.equal('None of upt.json, component.json, .upt.json were found in ' + __dirname);
            done();
        });
    });
});

describe('.read', function () {
    it('should give error if file does not exists', function (done) {
        uptJson.read(__dirname + '/willneverexist', function (err) {
            expect(err).to.be.an(Error);
            expect(err.code).to.equal('ENOENT');
            done();
        });
    });

    it('should give error if when reading an invalid json', function (done) {
        uptJson.read(__dirname + '/pkg-upt-json-malformed/upt.json', function (err) {
            expect(err).to.be.an(Error);
            expect(err.code).to.equal('EMALFORMED');
            expect(err.file).to.equal(path.resolve(__dirname + '/pkg-upt-json-malformed/upt.json'));
            done();
        });
    });

    it('should read the file and give an object', function (done) {
        uptJson.read(__dirname + '/pkg-upt-json/upt.json', function (err, json) {
            if (err) {
                return done(err);
            }

            expect(json).to.be.an('object');
            expect(json.name).to.equal('some-pkg');
            expect(json.version).to.equal('0.0.0');

            done();
        });
    });

    it('should give the json file that was read', function (done) {
        uptJson.read(__dirname + '/pkg-upt-json', function (err, json, file) {
            if (err) {
                return done(err);
            }


            expect(file).to.equal(__dirname + '/pkg-upt-json/upt.json');
            done();
        });
    });

    it('should find for a json file if a directory is given', function (done) {
        uptJson.read(__dirname + '/pkg-component-json', function (err, json, file) {
            if (err) {
                return done(err);
            }

            expect(json).to.be.an('object');
            expect(json.name).to.equal('some-pkg');
            expect(json.version).to.equal('0.0.0');
            expect(file).to.equal(path.resolve(__dirname + '/pkg-component-json/component.json'));
            done();
        });
    });

    it('should validate the returned object unless validate is false', function (done) {
        uptJson.read(__dirname + '/pkg-upt-json-invalid/upt.json', function (err) {
            expect(err).to.be.an(Error);
            expect(err.message).to.contain('name');
            expect(err.file).to.equal(path.resolve(__dirname + '/pkg-upt-json-invalid/upt.json'));

            uptJson.read(__dirname + '/pkg-upt-json-invalid/upt.json', { validate: false }, function (err) {
                done(err);
            });
        });
    });

    it('should normalize the returned object if normalize is true', function (done) {
        uptJson.read(__dirname + '/pkg-upt-json/upt.json', function (err, json) {
            if (err) {
                return done(err);
            }

            expect(json.main).to.equal('foo.js');

            uptJson.read(__dirname + '/pkg-upt-json/upt.json', { normalize: true }, function (err, json) {
                if (err) {
                    return done(err);
                }

                expect(json.main).to.eql(['foo.js']);
                done();
            });
        });
    });
});

describe('.parse', function () {
    it('should return the same object, unless clone is true', function () {
        var json = { name: 'foo' };

        expect(uptJson.parse(json)).to.equal(json);
        expect(uptJson.parse(json, { clone: true })).to.not.equal(json);
        expect(uptJson.parse(json, { clone: true })).to.eql(json);
    });

    it('should validate the passed object, unless validate is false', function () {
        expect(function () {
            uptJson.parse({});
        }).to.throwException(/name/);

        expect(function () {
            uptJson.parse({}, { validate: false });
        }).to.not.throwException();
    });

    it('should not normalize the passed object unless normalize is true', function () {
        var json = { name: 'foo', main: 'foo.js' };

        uptJson.parse(json);
        expect(json.main).to.eql('foo.js');

        uptJson.parse(json, { normalize: true });
        expect(json.main).to.eql(['foo.js']);
    });
});

describe('.validate', function () {
    it('should validate the name property', function () {
        expect(function () {
            uptJson.validate({});
        }).to.throwException(/name/);
    });
});

describe('.normalize', function () {
    it('should normalize the main property', function () {
        var json = { name: 'foo', main: 'foo.js' };

        uptJson.normalize(json);
        expect(json.main).to.eql(['foo.js']);
    });
});
