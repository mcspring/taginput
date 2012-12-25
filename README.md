jquery.taginput.js
==================

jQuery tag input plugin

Usage
=====
1, auto show suggested tags
```
$('#input_tag_id').taginput({
  suggestionTags: ['javascript', 'js', 'jquery', 'plugin', 'example'],
  suggestionAutoShow: true
});
```

2, show suggested tags when input focused
```
$('#input_tag_id').taginput({
  suggestionTags: ['javascript', 'js', 'jquery', 'plugin', 'example'],
  suggestionAutoShow: false
});
```

3, dynamic show suggestion tags use local data
```
$('#input_tag_id').taginput({
  tags: [
    {name:'javascript', weight:20},
    {name:'js', weight:50},
    {name:'jquery', weight:15},
    {name:'plugin', weight:10},
    {name:'example', weight:5}]
});
```

4, dynamic show suggestion tags use remote data
```
$('#input_tag_id').taginput({
  tagsUrl: '/path/to/server/tags/resource'  # NOTE: the responsed data *MUST* in format of tags!
});
```

5, mixed
```
$('#input_tag_id').taginput({
  tagsUrl: '/path/to/server/tags/resource',  # NOTE: the responsed data *MUST* in format of tags!
  suggestionTags: ['javascript', 'js', 'jquery', 'plugin', 'example'],
  suggestionAutoShow: true
});
```

Configuration
=============
```
{
  tags: [], // Local tags object array, format in [{name:"tag1", weight:1}, {name:"tag2", weight:5}, ...]
  tagsUrl: null, // Loading tags remote if supplied, the returned value *MUST* in the same format with tags.
  forceReload: false, // Whether reload tags remote?
  sortBy: 'weight', // Show tags in which ordered? Available value are 'name'|'weight'|'none', default value is 'weight'
  autoFilter: true, // True to show only matching tags, otherwise you should use server side filter.
  boldify: true, // True to bodify the matching part of tag in dropdown list
  inputSeparator: ',', // Tag separator use in input field, default value is ','
  inputPlaceholder: 'Multi tags are separator by comma', // Default input field placeholder
  suggestionTags: [], // Tag object array, format in ['tag1', 'tag2', ...]
  suggestionWrapper: null,
  suggestionAutoShow: false // False to show tags dropdown list when typing, otherwise when input field focusing.
}
