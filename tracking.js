import ua from 'universal-analytics';
import Amplitude from 'amplitude';

const amplitude = new Amplitude(process.env.AMPLITUDE);

export default (teamId, eventData) => {
  // Google Analytics
  const visitor = ua(process.env.GA, teamId, {https: true, strictCidFormat: false});
  visitor.event(eventData).send();

  var data = {
    event_type: eventData.ec, 
    user_id: eventData.user, 
    event_properties: {
      coin: eventData.ea
    },
    user_properties: {
      teamId,
    }
  };
  amplitude.track(data);
};
