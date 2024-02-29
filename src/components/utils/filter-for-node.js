const makeCrsFilter4node = (ls) => {
    return {'CQL_FILTER': 'node_id in ('+ls.join(',')+')'}
}

export default makeCrsFilter4node;