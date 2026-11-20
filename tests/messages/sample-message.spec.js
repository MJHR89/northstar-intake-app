import assert from 'node:assert';
import { beforeEach, describe, it, mock } from 'node:test';
import { clearRequests, saveRequest, updateRequest } from '../../lib/intake-store.js';
import { sampleMessageCallback } from '../../listeners/messages/sample-message.js';

describe('messages', () => {
  let fakeMessage;
  let fakeClient;
  let fakeLogger;

  beforeEach(() => {
    clearRequests();
    fakeMessage = {
      text: 'new request',
      channel: 'C123',
      ts: '111.222',
      user: 'U123',
    };
    fakeClient = {
      chat: {
        postMessage: mock.fn(async () => ({ ts: '123.456', thread_ts: '111.222' })),
      },
      views: {
        publish: mock.fn(),
      },
    };
    fakeLogger = {
      error: mock.fn(),
    };
  });

  it('should post threaded selector message', async () => {
    await sampleMessageCallback({
      message: fakeMessage,
      client: fakeClient,
      logger: fakeLogger,
    });

    assert.strictEqual(fakeClient.chat.postMessage.mock.callCount(), 1);
    assert.strictEqual(fakeClient.views.publish.mock.callCount(), 1);
    const threadCallArgs = fakeClient.chat.postMessage.mock.calls[0].arguments[0];
    assert.strictEqual(threadCallArgs.text, 'Thanks for submitting your request. Choose a request type below.');
    assert.strictEqual(threadCallArgs.channel, 'C123');
    assert.strictEqual(threadCallArgs.thread_ts, '111.222');
  });

  it('should post completion when user replies to pending request thread', async () => {
    saveRequest({ userId: 'U123', channelId: 'C123', threadTs: '111.222' });
    updateRequest({
      userId: 'U123',
      threadTs: '111.222',
      requestType: 'Equipment',
      status: 'Awaiting details',
    });

    await sampleMessageCallback({
      message: {
        text: 'Need a new monitor',
        channel: 'C123',
        thread_ts: '111.222',
        user: 'U123',
      },
      client: fakeClient,
      logger: fakeLogger,
    });

    assert.strictEqual(fakeClient.chat.postMessage.mock.callCount(), 1);
    const completionArgs = fakeClient.chat.postMessage.mock.calls[0].arguments[0];
    assert.strictEqual(completionArgs.text, 'Intake complete.');
    assert.strictEqual(completionArgs.thread_ts, '111.222');
    assert.strictEqual(fakeClient.views.publish.mock.callCount(), 1);
  });

  it('should log error when postMessage throws exception', async () => {
    const testError = new Error('test exception');
    fakeClient.chat.postMessage = mock.fn(() => {
      throw testError;
    });
    await sampleMessageCallback({
      message: fakeMessage,
      client: fakeClient,
      logger: fakeLogger,
    });

    assert.strictEqual(fakeClient.chat.postMessage.mock.callCount(), 1);
    assert.deepEqual(fakeLogger.error.mock.calls[0].arguments, [testError]);
  });

  it('should ignore non-trigger messages', async () => {
    await sampleMessageCallback({
      message: { text: 'hello there', channel: 'C123' },
      client: fakeClient,
      logger: fakeLogger,
    });

    assert.strictEqual(fakeClient.chat.postMessage.mock.callCount(), 0);
  });
});
