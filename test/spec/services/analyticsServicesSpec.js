/**
 * Created by Sabe on 6/11/2015.
 */
'use strict';

describe('Analytics Service', function () {
  var analytics, user;

  beforeEach(function() {
    user = specHelper.newUser();
    user.contributor = {};
    user.purchased = { plan: {} };

    module(function($provide) {
      $provide.value('User', {user: user});
    });

    inject(function(Analytics) {
      analytics = Analytics;
    });
  });

  context('error handling', function() {

    beforeEach(function() {
      sandbox.stub(console, 'log');
    });

    it('does not accept tracking events without required properties', function() {
      analytics.track('action');
      analytics.track({'hitType':'pageview','eventCategory':'green'});
      analytics.track({'hitType':'pageview','eventAction':'eat'});
      analytics.track({'eventCategory':'green','eventAction':'eat'});
      analytics.track({'hitType':'pageview'});
      analytics.track({'eventCategory':'green'});
      analytics.track({'eventAction':'eat'});
      expect(console.log.callCount).to.eql(7);
    });

    it('does not accept tracking events with incorrect hit type', function () {
      analytics.track({'hitType':'moogly','eventCategory':'green','eventAction':'eat'});
      expect(console.log).to.have.been.calledOnce;
    });
  });

  context('Amplitude', function() {

    beforeEach(function() {
      sandbox.stub(amplitude, 'setUserId');
      sandbox.stub(amplitude, 'logEvent');
      sandbox.stub(amplitude, 'setUserProperties');
    });

    describe('register', function() {
      it('sets up tracking when user registers', function() {
        analytics.register();
        expect(amplitude.setUserId).to.have.been.calledOnce;
      });
    });

    describe('login', function() {
      it('sets up tracking when user logs in', function() {
        analytics.login();
        expect(amplitude.setUserId).to.have.been.calledOnce;
      });
    });

    describe('track', function() {
      it('tracks a simple user action', function() {
        analytics.track({'hitType':'event','eventCategory':'behavior','eventAction':'cron'});
        expect(amplitude.logEvent).to.have.been.calledOnce;
        expect(amplitude.logEvent).to.have.been.calledWith('cron',{'hitType':'event','eventCategory':'behavior','eventAction':'cron'});
      });

      it('tracks a user action with additional properties', function() {
        analytics.track({'hitType':'event','eventCategory':'behavior','eventAction':'cron','booleanProperty':true,'numericProperty':17,'stringProperty':'bagel'});
        expect(amplitude.logEvent).to.have.been.calledOnce;
        expect(amplitude.logEvent).to.have.been.calledWith('cron',{'hitType':'event','eventCategory':'behavior','eventAction':'cron','booleanProperty':true,'numericProperty':17,'stringProperty':'bagel'});
      });
    });

    describe('updateUser', function() {
      it('updates user-level properties with values provided in properties', function() {
        analytics.updateUser({'userBoolean': false, 'userNumber': -8, 'userString': 'Enlightened'});
        expect(amplitude.setUserProperties).to.have.been.calledOnce;
        expect(amplitude.setUserProperties).to.have.been.calledWith({'userBoolean': false, 'userNumber': -8, 'userString': 'Enlightened'});
      });

      it('updates user-level properties with certain user values when no properties are provided', function() {
        user._id = 'unique-user-id';
        user.stats.class = 'wizard';
        user.stats.exp = 35.7;
        user.stats.gp = 43.2;
        user.stats.hp = 47.8;
        user.stats.lvl = 24;
        user.stats.mp = 41;
        user.contributor.level = 1;
        user.purchased.plan.planId = 'unique-plan-id';

        analytics.updateUser();
        expect(amplitude.setUserProperties).to.have.been.calledOnce;
        expect(amplitude.setUserProperties).to.have.been.calledWith({
          UUID: 'unique-user-id',
          Class: 'wizard',
          Experience: 35,
          Gold: 43,
          Health: 48,
          Level: 24,
          Mana: 41,
          contributorLevel: 1,
          subscription: 'unique-plan-id'
        });
      });
    });
  });

  context('Google Analytics', function() {

    beforeEach(function() {
      sandbox.stub(window, 'ga');
    });

    describe('register', function() {
      it('sets up tracking when user registers', function() {
        analytics.register();
        expect(ga).to.have.been.calledOnce;
        expect(ga).to.have.been.calledWith('set');
      });
    });

    describe('login', function() {
      it('sets up tracking when user logs in', function() {
        analytics.login();
        expect(ga).to.have.been.calledOnce;
        expect(ga).to.have.been.calledWith('set');
      });
    });

    describe('track', function() {
      it('tracks a simple user action', function() {
        analytics.track({'hitType':'event','eventCategory':'behavior','eventAction':'cron'});
        expect(ga).to.have.been.calledOnce;
        expect(ga).to.have.been.calledWith('send',{'hitType':'event','eventCategory':'behavior','eventAction':'cron'});
      });

      it('tracks a user action with additional properties', function() {
        analytics.track({'hitType':'event','eventCategory':'behavior','eventAction':'cron','booleanProperty':true,'numericProperty':17,'stringProperty':'bagel'});
        expect(ga).to.have.been.calledOnce;
        expect(ga).to.have.been.calledWith('send',{'hitType':'event','eventCategory':'behavior','eventAction':'cron','booleanProperty':true,'numericProperty':17,'stringProperty':'bagel'});
      });
    });

    describe('updateUser', function() {
      it('updates user-level properties with values provided in properties', function() {
        analytics.updateUser({'userBoolean': false, 'userNumber': -8, 'userString': 'Enlightened'});
        expect(ga).to.have.been.calledOnce;
        expect(ga).to.have.been.calledWith('set', {'userBoolean': false, 'userNumber': -8, 'userString': 'Enlightened'});
      });

      it('updates user-level properties', function() {
        user._id = 'unique-user-id';
        user.stats.class = 'wizard';
        user.stats.exp = 35.7;
        user.stats.gp = 43.2;
        user.stats.hp = 47.8;
        user.stats.lvl = 24;
        user.stats.mp = 41;
        user.contributor.level = 1;
        user.purchased.plan.planId = 'unique-plan-id';

        analytics.updateUser();
        expect(ga).to.have.been.calledOnce;
        expect(ga).to.have.been.calledWith('set',{
          UUID: 'unique-user-id',
          Class: 'wizard',
          Experience: 35,
          Gold: 43,
          Health: 48,
          Level: 24,
          Mana: 41,
          contributorLevel: 1,
          subscription: 'unique-plan-id'
        });
      });
    });
  });

  context.skip('Mixpanel', function() { // Mixpanel not currently in use

    beforeEach(function() {
      sandbox.stub(mixpanel, 'alias');
      sandbox.stub(mixpanel, 'identify');
      sandbox.stub(mixpanel, 'track');
      sandbox.stub(mixpanel, 'register');
    });

    it('sets up tracking when user registers', function() {
      analytics.register();
      expect(mixpanel.alias).to.have.been.calledOnce;
    });

    it('sets up tracking when user logs in', function() {
      analytics.login();
      expect(mixpanel.identify).to.have.been.calledOnce;
    });

    it('tracks a simple user action', function() {
      analytics.track({'hitType':'event','eventCategory':'behavior','eventAction':'cron'});
      expect(mixpanel.track).to.have.been.calledOnce;
      expect(mixpanel.track).to.have.been.calledWith('cron',{'hitType':'event','eventCategory':'behavior','eventAction':'cron'});
    });

    it('tracks a user action with additional properties', function() {
      analytics.track({'hitType':'event','eventCategory':'behavior','eventAction':'cron','booleanProperty':true,'numericProperty':17,'stringProperty':'bagel'});
      expect(mixpanel.track).to.have.been.calledOnce;
      expect(mixpanel.track).to.have.been.calledWith('cron',{'hitType':'event','eventCategory':'behavior','eventAction':'cron','booleanProperty':true,'numericProperty':17,'stringProperty':'bagel'});
    });

    it('updates user-level properties', function() {
      analytics.updateUser({'userBoolean': false, 'userNumber': -8, 'userString': 'Enlightened'});
      expect(mixpanel.register).to.have.been.calledOnce;
      expect(mixpanel.register).to.have.been.calledWith({'userBoolean': false, 'userNumber': -8, 'userString': 'Enlightened'});
    });
  });
});
