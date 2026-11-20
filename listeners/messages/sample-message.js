import { getRequestByThread, saveRequest, updateRequest } from '../../lib/intake-store.js';
import { publishHomeView } from '../events/home-view.js';

const REQUEST_TRIGGER = 'new request';

const sampleMessageCallback = async ({ message, client, logger }) => {
  try {
    if (message.subtype || message.bot_id) {
      return;
    }

    if (message.text?.trim().toLowerCase() === REQUEST_TRIGGER) {
      const intakeThreadMessage = await client.chat.postMessage({
        channel: message.channel,
        thread_ts: message.ts,
        text: 'Thanks for submitting your request. Choose a request type below.',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: 'Thanks for submitting your request. Choose a request type below.',
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: 'Choose a request type for your Northstar intake request.',
            },
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'Access',
                  emoji: true,
                },
                action_id: 'request_type_access',
                value: 'Access',
              },
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'Equipment',
                  emoji: true,
                },
                action_id: 'request_type_equipment',
                value: 'Equipment',
              },
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'Other',
                  emoji: true,
                },
                action_id: 'request_type_other',
                value: 'Other',
              },
            ],
          },
        ],
      });

      saveRequest({
        userId: message.user,
        channelId: message.channel,
        threadTs: intakeThreadMessage.thread_ts ?? message.ts,
      });
      await publishHomeView(client, message.user);
      return;
    }

    if (!message.thread_ts) {
      return;
    }

    const request = getRequestByThread({
      userId: message.user,
      threadTs: message.thread_ts,
    });
    if (!request || request.status !== 'Awaiting details' || !request.requestType) {
      return;
    }

    await client.chat.postMessage({
      channel: message.channel,
      thread_ts: message.thread_ts,
      text: 'Intake complete.',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text:
              `<@${message.user}> submitted an ${request.requestType} request.\n` +
              `*Details:* ${message.text}\n` +
              '*Status:* Intake complete. Processing started.',
          },
        },
      ],
    });

    updateRequest({
      userId: message.user,
      threadTs: message.thread_ts,
      status: 'Processing',
    });
    await publishHomeView(client, message.user);
  } catch (error) {
    logger.error(error);
  }
};

export { sampleMessageCallback };
