const makeCrsFilter = (ls) => {
   return {'CQL_FILTER': 'id in ('+ls.filter(e => e !== '-1').join(',')+')'}
}

export default makeCrsFilter;