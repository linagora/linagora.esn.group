const { expect } = require('chai');

describe('The registry module', function() {
  let getModule;

  beforeEach(function() {
    getModule = () => require(`${this.moduleHelpers.backendPath}/lib/registry`)(this.moduleHelpers.dependencies);
  });

  describe('The register function', function() {
    it('should add handler', function() {
      const handler = { foo: 'bar' };
      const registryModule = getModule();

      registryModule.register('foo', handler);

      expect(registryModule.getHandlers()).to.deep.equal([handler]);
    });

    it('should do nothing when the name is taken', function() {
      const handler = { foo: 'bar' };
      const name = 'foo';

      const registryModule = getModule();

      registryModule.register(name, handler);
      registryModule.register(name, handler);

      expect(registryModule.getHandlers().length).to.equal(1);
    });
  });

  describe('The getHandlers function', function() {
    it('should return a list of handlers', function() {
      const handler1 = { foo: 'foo' };
      const handler2 = { bar: 'bar' };

      const registryModule = getModule();

      registryModule.register('foo', handler1);
      registryModule.register('bar', handler2);

      expect(registryModule.getHandlers()).to.deep.equal([handler1, handler2]);
    });
  });
});
