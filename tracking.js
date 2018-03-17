import ua from 'universal-analytics';

export default (teamId, eventData) => {
  const visitor = ua(process.env.GA, teamId, {https: true, strictCidFormat: false});
  visitor.event(eventData).send();
};
