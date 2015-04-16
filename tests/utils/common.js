define(['$'],
    function($) {
        return {
            errors: {
                MULTIPLE_SEARCH_TYPES: 'The searchType parameter should contain only one type, i.e. { src: \'script1\' }',
                MULTIPLE_SEARCH_PATTERNS: 'The searchType value should be a string or an array with only a single item, i.e. { src: \'script1\' } or { contains: [\'script1\'] }'
            }
        }
    });