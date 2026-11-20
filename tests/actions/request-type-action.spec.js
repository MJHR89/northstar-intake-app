import assert from 'node:assert';
import { beforeEach, describe, it, mock } from 'node:test';
import { requestTypeActionCallback } from '../../listeners/actions/request-type-action.js';

describe('request type actions', () => {
  let fakeAck;
  let fakeClient;
  let fakeBody;
  let fakeAction;
  let fakeLogger;

  beforeEach(() => {
    fakeAck = mock.fn();
    fakeClient = {
      chat: {
        postMessage: mock.fn(),
      },
      views: {
        publish: mock.fn(),
      },
    };
    fakeBody = {
      user: {
        id: 'U123',
      },
      channel: {
        id: 'C123',
      },
      message: {
        thread_ts: '111.222',
      },
    };
    fakeAction = {
      value: 'Equipment',
    };
    fakeLogger = {
      error: mock.fn(),
    };
  });

  it('should acknowledge and post follow-up in thread', async () => {
    await requestTypeActionCallback({
      ack: fakeAck,
      client: fakeClient,
      body: fakeBody,
      action: fakeAction,
      logger: fakeLogger,
    });

    assert.strictEqual(fakeAck.mock.callCount(), 1);
    assert.strictEqual(fakeClient.chat.postMessage.mock.callCount(), 1);
    assert.strictEqual(fakeClient.views.publish.mock.callCount(), 1);
    const followUpArgs = fakeClient.chat.postMessage.mock.calls[0].arguments[0];
    assert.strictEqual(followUpArgs.channel, 'C123');
    assert.strictEqual(followUpArgs.thread_ts, '111.222');
    assert.strictEqual(followUpArgs.text, 'Equipment request selected. What equipment do you need?');
  });

  it('should log error when ack throws exception', async () => {
    const testError = new Error('test exception');
    fakeAck = mock.fn(() => {
      throw testError;
    });

    await requestTypeActionCallback({
      ack: fakeAck,
      client: fakeClient,
      body: fakeBody,
      action: fakeAction,
      logger: fakeLogger,
    });

    assert.strictEqual(fakeAck.mock.callCount(), 1);
    assert.deepEqual(fakeLogger.error.mock.calls[0].arguments, [testError]);
  });
});
