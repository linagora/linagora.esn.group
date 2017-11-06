'use strict';

/* global chai: false */
/* global sinon: false */

var expect = chai.expect;

describe('The groupAttendeeProvider service', function() {
  var $q, $rootScope, groupApiClient, groupAttendeeProvider, GROUP_OBJECT_TYPE;

  beforeEach(function() {
    groupApiClient = {};
    angular.mock.module('linagora.esn.group');

    angular.mock.inject(function(_$rootScope_, _$q_, _groupAttendeeProvider_, _GROUP_OBJECT_TYPE_, _groupApiClient_) {
      $rootScope = _$rootScope_;
      $q = _$q_;
      groupAttendeeProvider = _groupAttendeeProvider_;
      GROUP_OBJECT_TYPE = _GROUP_OBJECT_TYPE_;
      groupApiClient = _groupApiClient_;
    });
  });

  it('should contain the right objectType', function() {
    expect(groupAttendeeProvider.objectType).to.equal(GROUP_OBJECT_TYPE);
    expect(groupAttendeeProvider.searchAttendee).to.be.a.function;
    expect(groupAttendeeProvider.templateUrl).to.be.defined;
  });

  describe('The searchAttendee function', function() {
    var query, limit, offset;

    beforeEach(function() {
      query = 'searchme';
      limit = 10;
      offset = 0;
    });

    it('should resolve with empty array when call to groupApiClient.search fails', function(done) {
      groupApiClient.search = sinon.stub().returns($q.reject(new Error('I failed')));
      groupAttendeeProvider.searchAttendee(query, limit, offset).then(function(result) {
        expect(result).to.be.an('array').that.is.empty;
        expect(groupApiClient.search).to.have.been.calledWith(query, limit, offset);
        done();
      }, done);

      $rootScope.$digest();
    });

    it('should resolve with groupApiClient.search result', function(done) {
      var group1 = { email: 'room1@open-paas.org', name: 'Room 1', id: 1 };
      var group2 = { email: 'room2@open-paas.org', name: 'Room 2', id: 2 };
      var group3 = { email: 'room3@open-paas.org', name: 'Room 3', id: 3 };
      var data = [group1, group2, group3];

      groupApiClient.search = sinon.stub().returns($q.when({ data: data }));
      groupAttendeeProvider.searchAttendee(query, limit, offset).then(function(result) {
        expect(groupApiClient.search).to.have.been.calledWith(query, limit, offset);
        expect(result).to.shallowDeepEqual([
          {
            id: group1.id,
            displayName: group1.name,
            email: group1.email
          },
          {
            id: group2.id,
            displayName: group2.name,
            email: group2.email
          },
          {
            id: group3.id,
            displayName: group3.name,
            email: group3.email
          }
        ]);
        done();
      }, done);

      $rootScope.$digest();
    });
  });
});
