const { expect } = require('chai');

describe('The lib/search/denormalize module', function() {
  let getModule;
  let EVENTS;

  beforeEach(function() {
    getModule = () => require(this.moduleHelpers.backendPath + '/lib/search/denormalize');
    EVENTS = require(this.moduleHelpers.backendPath + '/lib/constants').EVENTS;
  });

  describe('The denormalize function', function() {
    it('should return group name and email', function() {
      const event = {
        name: EVENTS.CREATED,
        payload: { name: 'group name', email: 'group@email.com' }
      };

      expect(getModule().denormalize(event)).to.deep.equal({
        name: event.payload.name,
        email: event.payload.email
      });
    });

    it('should return also the first domain ID of group', function() {
      const event = {
        name: EVENTS.CREATED,
        payload: { name: 'group name', email: 'group@email.com', domain_ids: ['1', '2', '3'] }
      };

      expect(getModule().denormalize(event)).to.deep.equal({
        name: event.payload.name,
        email: event.payload.email,
        domain_id: event.payload.domain_ids[0]
      });
    });

    it('should return information of updated group on update event', function() {
      const event = {
        name: EVENTS.UPDATED,
        payload: { name: 'group name', email: 'group@email.com' }
      };

      expect(getModule().denormalize(event)).to.deep.equal({
        name: event.payload.name,
        email: event.payload.email
      });
    });
  });

  describe('The getId function', function() {
    it('should return string version of event ID', function() {
      const event = {
        id: 123
      };

      expect(getModule().getId(event)).to.equal(String(event.id));
    });
  });
});
