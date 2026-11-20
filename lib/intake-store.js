const requestStore = new Map();

const MAX_REQUESTS_PER_USER = 20;

const getRequestsForUser = (userId) => {
  return requestStore.get(userId) ?? [];
};

const getRequestByThread = ({ userId, threadTs }) => {
  return getRequestsForUser(userId).find((request) => request.threadTs === threadTs);
};

const saveRequest = ({ userId, channelId, threadTs }) => {
  const requests = getRequestsForUser(userId);
  const next = [
    {
      id: threadTs,
      channelId,
      threadTs,
      status: 'Submitted',
      requestType: null,
      createdAt: Date.now(),
    },
    ...requests,
  ].slice(0, MAX_REQUESTS_PER_USER);
  requestStore.set(userId, next);
};

const updateRequest = ({ userId, threadTs, requestType, status }) => {
  const requests = getRequestsForUser(userId);
  const next = requests.map((request) => {
    if (request.threadTs !== threadTs) {
      return request;
    }
    return {
      ...request,
      requestType: requestType ?? request.requestType,
      status: status ?? request.status,
    };
  });
  requestStore.set(userId, next);
};

const clearRequests = () => {
  requestStore.clear();
};

export { clearRequests, getRequestByThread, getRequestsForUser, saveRequest, updateRequest };
