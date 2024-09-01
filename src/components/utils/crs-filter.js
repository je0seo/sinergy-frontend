export const makeCrsFilter = (ls) => {
    return 'id in (' + ls.filter(e => e !== '-1').join(',') + ')';
}

export const ShowReqFilter = (requestData) => {
      if (requestData.Req === 'facilities') {
         return {'CQL_FILTER': 'node_att in (8)'}
      }
      else if (requestData.Req === 'unpaved') {
         return {'CQL_FILTER': 'link_att in (4)'}
      }
      else if (requestData.Req === 'stairs') {
         return {'CQL_FILTER': 'link_att in (5)'}
      }
      else if (requestData.Req === 'slope') {
         return {'CQL_FILTER': 'grad_deg >= 3.18'}
      }
      else if (requestData.Req === 'bump') {
         return {'CQL_FILTER': 'node_att in (3)'}
      }
      else if (requestData.Req === 'bol') {
         return {'CQL_FILTER': 'node_att in (1)'}
      }
}