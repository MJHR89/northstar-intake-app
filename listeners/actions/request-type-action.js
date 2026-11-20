import { updateRequest } from '../../lib/intake-store.js';
import { publishHomeView } from '../events/home-view.js';

const followUpPrompts = {
  Access: 'Access request selected. Which tool or system do you need access to?',
  Equipment: 'Equipment request selected. What equipment do you need?',
  Other: 'Other request selected. Please describe what you need.',
};

const requestTypeActionCallback = async ({ ack, client, body, action, logger }) => {
  try {
    await ack();

    const selectedType = action?.value ?? 'Other';
    const threadTs = body.message?.thread_ts ?? body.message?.ts;

    await client.chat.postMessage({
      channel: body.channel.id,
      thread_ts: threadTs,
      text: followUpPrompts[selectedType] ?? followUpPrompts.Other,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: followUpPrompts[selectedType] ?? followUpPrompts.Other,
          },
        },
      ],
    });

    updateRequest({
      userId: body.user.id,
      threadTs,
      requestType: selectedType,
      status: 'Awaiting details',
    });

    await publishHomeView(client, body.user.id);
  } catch (error) {
    logger.error(error);
  }
};

export { requestTypeActionCallback };
