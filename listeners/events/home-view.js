import { getRequestsForUser } from '../../lib/intake-store.js';

const buildHomeView = (userId) => {
  const requests = getRequestsForUser(userId);

  if (requests.length === 0) {
    return {
      type: 'home',
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: 'Northstar Intake',
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: 'No requests yet. Post `new request` in `#request-intake` to start.',
          },
        },
      ],
    };
  }

  const blocks = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: 'Northstar Intake Requests',
      },
    },
  ];

  for (const request of requests) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text:
          `*Status:* ${request.status}\n` +
          `*Type:* ${request.requestType ?? 'Pending'}\n` +
          `*Thread:* <https://slack.com/app_redirect?channel=${request.channelId}&message_ts=${request.threadTs}|Open request thread>`,
      },
    });
  }

  return {
    type: 'home',
    blocks,
  };
};

const publishHomeView = async (client, userId) => {
  await client.views.publish({
    user_id: userId,
    view: buildHomeView(userId),
  });
};

export { buildHomeView, publishHomeView };
