/*global $, QUnit, sinon */
QUnit.intuitionModule = function (name, intuition) {
	QUnit.module(name, {
		setup: function () {
			this.clock = sinon.useFakeTimers();
			this.stub$ajax = sinon.stub($, 'ajax');
		},
		teardown: function () {
			this.stub$ajax.restore();
			this.clock.restore();
		}
	});

	QUnit.test('load( String )', function (assert) {
		this.stub$ajax
			.onCall(0).returns($.Deferred().resolve({
				messages: {
					example: { foo: 'Foo value' }
				}
			}))
			.onCall(1).returns($.Deferred().resolve({
				error: 'Some error'
			}))
			.onCall(2).returns($.Deferred().reject())
			// Should be cached in program, no second ajax call for "example"
			.onCall(3).returns(null);

		intuition.load('example').done(function () {
			assert.equal(intuition.msg('example', 'foo'), 'Foo value', 'Normal fetch');
		});
		this.clock.tick(200);

		intuition.load('wee-data').fail(function () {
			assert.ok(true, 'Invalid data yields error');
		});
		this.clock.tick(200);

		intuition.load('wee-ajax').fail(function () {
			assert.ok(true, 'Ajax failure is forwarded to load() promise');
		});
		this.clock.tick(200);

		intuition.load('example').done(function () {
			assert.equal(intuition.msg('example', 'foo'), 'Foo value', 'Cache hit');
		});

		this.clock.tick(10);
	});

	QUnit.test('load( Array )', function (assert) {
		this.stub$ajax.onFirstCall().returns($.Deferred().resolve({
			messages: {
				one: { foo: 'Foo value', bar: 'Bar value' },
				two: { quux: 'Quux value' }
			}
		}).promise());

		intuition.load(['two', 'one']).done(function () {
			assert.equal(intuition.msg('one', 'bar'), 'Bar value');
			assert.equal(intuition.msg('two', 'quux'), 'Quux value');
		});

		this.clock.tick(200);
	});
};
