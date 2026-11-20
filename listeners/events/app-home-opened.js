import { publishHomeView } from './home-view.js';

const appHomeOpenedCallback = async ({ client, event, logger }) => {
  // Ignore the `app_home_opened` event for anything but the Home tab
  if (event.tab !== 'home') return;

  try {
    await publishHomeView(client, event.user);
  } catch (error) {
    logger.error(error);
  }
};

export { appHomeOpenedCallback };
