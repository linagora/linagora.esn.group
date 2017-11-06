'use strict';

/* global chai, sinon: false */

var expect = chai.expect;

describe('The groupMemberResolverService service', function() {
  var $q, $rootScope, groupMemberResolverService, groupApiClient, email;

  beforeEach(function() {
    email = 'group@open-paas.org';
    groupApiClient = {
      getFromEmail: sinon.stub(),
      getAllMembers: sinon.stub()
    };
  });

  beforeEach(function() {
    angular.mock.module('linagora.esn.group');
    angular.mock.module(function($provide) {
      $provide.value('groupApiClient', groupApiClient);
    });
  });

  beforeEach(inject(function(_$rootScope_, _$q_, _groupMemberResolverService_) {
    $rootScope = _$rootScope_;
    $q = _$q_;
    groupMemberResolverService = _groupMemberResolverService_;
  }));

  it('should resolve with empty array when no group with given email', function(done) {
    groupApiClient.getFromEmail.returns($q.when({data: []}));

    groupMemberResolverService(email).then(function(result) {
      expect(result).to.be.an('array').that.is.empty;
      expect(groupApiClient.getFromEmail).to.have.been.calledWith(email);
      expect(groupApiClient.getAllMembers).to.not.have.been.called;
      done();
    });

    $rootScope.$digest();
  });

  it('should resolve with group members', function(done) {
    var group = { id: 1 };
    var members = [1, 2, 3];

    groupApiClient.getFromEmail.returns($q.when({data: [group]}));
    groupApiClient.getAllMembers.returns($q.when({data: members}));

    groupMemberResolverService(email).then(function(result) {
      expect(result).to.deep.equal(members);
      expect(groupApiClient.getFromEmail).to.have.been.calledWith(email);
      expect(groupApiClient.getAllMembers).to.have.been.calledWith(group.id);
      done();
    });

    $rootScope.$digest();
  });
});
