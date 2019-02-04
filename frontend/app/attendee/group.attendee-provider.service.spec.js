'use strict';

/* global chai: false */

var expect = chai.expect;

describe('The groupAttendeeProvider service', function() {
  var groupAttendeeProvider, GROUP_OBJECT_TYPE;

  beforeEach(function() {
    angular.mock.module('linagora.esn.group');

    angular.mock.inject(function(_groupAttendeeProvider_, _GROUP_OBJECT_TYPE_) {
      groupAttendeeProvider = _groupAttendeeProvider_;
      GROUP_OBJECT_TYPE = _GROUP_OBJECT_TYPE_;
    });
  });

  it('should contain the right objectType', function() {
    expect(groupAttendeeProvider.objectType).to.equal(GROUP_OBJECT_TYPE);
    expect(groupAttendeeProvider.templateUrl).to.be.defined;
  });
});
