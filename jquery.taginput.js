/**
 * Author: Spring MC <Heresy.MC@gmail.com>
 * License: open-lab license
 * This is inspired in jquery.tagInput.js plugin, see: http://roberto.open-lab.com/2010/02/10/a-delicious-javascript-tagging-input-field/
 */
(function($){

  var PluginName, PluginDefaults, TagInput;

  PluginName = 'TagInput';
  PluginDefaults = {
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

  TagInput = function(element, options){
    this.$element = $(element);
    this.options = $.extend({}, PluginDefaults, options || {});

    // setup default refs
    this._search = '';
    this._dropdownWrapper = null;
    this._suggestionWrapper = null;

    this.initialize();

    return this;
  };

  TagInput.prototype = {

    constructor: TagInput,

    initialize: function(){
      this.$element.on({
        focus: $.proxy(this.show, this),
        blur: $.proxy(this.hide, this),
        keydown: $.proxy(this._onKeydown, this)
      });

      if (this.options.inputPlaceholder && (this.$element.attr('placeholder') == '')) {
        this.$element.attr('placeholder', this.options.inputPlaceholder);
      }

      if (this.options.suggestionAutoShow){
        this._drawSuggestion();
      }
    },

    show: function(){
      if (!this.options.suggestionAutoShow) {
        this._drawSuggestion();
      }

      this._drawDropdown();
      this._drawTags();
    },

    hide: function (){
      if (!this._dropdownWrapper){
        return;
      }

      this._formatTags(this.$element.val());

      this._dropdownWrapper.fadeOut(200);
    },

    scrollTag: function(row, isUp){
      if (row.size() <= 0){
        return;
      }

      var wrapper = this._dropdownWrapper.get(0),
          taglist = row.get(0);
      if (isUp){
        if (this._dropdownWrapper.scrollTop() > taglist.offsetTop){
          this._dropdownWrapper.scrollTop(taglist.offsetTop);
        }
      } else {
        if ((taglist.offsetTop + taglist.offsetHeight) > (wrapper.scrollTop + wrapper.offsetHeight)) {
          wrapper.scrollTop = taglist.offsetTop + taglist.offsetHeight - wrapper.offsetHeight;
        }
      }

      this._dropdownWrapper.find('div.tagInputSel').removeClass('tagInputSel');
      row.addClass('tagInputSel');
    },

    selectTag: function(row) {
      var selected_tag = row.find('.tagListTag').text(),
          input_tags = $.trim(this.$element.val());
      if (input_tags == this._search) {
        this.$element.val(selected_tag);
      } else {
        var separator = this.options.inputSeparator,
            separator_idx = input_tags.lastIndexOf(separator),
            new_separator = separator_idx <= 0 ? "" : (separator + (separator == " " ? "" : " ")),
            new_tags = $.trim(input_tags.substr(0, separator_idx) + new_separator + selected_tag);
        this.$element.val(new_tags);
        this._highlightSuggestionTags();
      }

      this._dropdownWrapper.fadeOut();
    },

    containsTag: function(s, tag){
      tag = $.trim(tag);

      var tags = s.split(this.options.inputSeparator),
          ret = false, i, j;
      for(i = 0, j = tags.length; i < j; i++){
        if ($.trim(tags[i]) == tag){
          ret = true;
          break;
        }
      }

      return ret;
    },

    _loadTags: function(force_reload){
      // Use locale settings if supplied
      if (this.options.tags.length > 0) {
        return this._sortTags(this.options.tags);
      }

      var search_prefix = this._search[0];

      force_reload = (force_reload == true);
      if (force_reload) {
        this._cacheTags[search_prefix] = null;
      }

      if (this._cacheTags[search_prefix] == 'loading') {
        return [];
      }

      if (this._cacheTags[search_prefix] != null) {
        return this._cacheTags[search_prefix];
      }

      if (this.options.tagsUrl) {
        this._cacheTags[search_prefix] = 'loading';

        var that = this;
        $.getJSON(this.options.tagsUrl, function(data){
          that._cacheTags[search_prefix] = that._sortTags(data);
        });
      } else {
        throw 'Invalid tagsUrl configuration';
      }
    },

    _sortTags: function(tags){
      var sort_by = this.options.sortBy;
      if (sort_by == 'weight') {
        tags = tags.sort(function (a, b) {
          if (a.weight < b.weight) {
            return 1;
          }
          if (a.weight > b.weight) {
            return -1;
          }
          return 0;
        });
      }
      else if (sort_by == 'name') {
        tags = tags.sort(function (a, b) {
          if (a.name < b.name) {
            return -1;
          }
          if (a.name > b.name) {
            return 1;
          }
          return 0;
        });
      }

      return tags;
    },

    _drawSuggestion: function(){
      if (this._suggestionWrapper){
        return;
      }

      var tags = this.options.suggestionTags;
      if (tags.length <= 0) {
        return;
      }

      this._suggestionWrapper = $(this.options.suggestionWrapper);
      if (!this._suggestionWrapper.size()){
        // create a suggestion wrapper
        var template = $('<div class="tagSuggestionWrapper"><em class="tagSuggestionLabel">Suggested tags: </em><div class="tagSuggestionTags"></div></div>');
        this._suggestionWrapper = template.find('.tagSuggestionTags');
        this.$element.after(template);
      }

      // fill with suggestion tags
      var lists = [], i;
      for (i in tags){
        lists[lists.length] = '<span class="tag">' + tags[i] + '</span>';
      }
      this._suggestionWrapper.append(lists.join(''));

      // bind click on suggestion tags
      var that = this;
      this._suggestionWrapper.on('click', '.tag', function(){
        var input_tags = that.$element.val(),
            tag = $(this).text();

        //check if already present
        var re = new RegExp(tag+"\\b", "g");
        if (that.containsTag(input_tags, tag)){ //remove all the tag
          input_tags = input_tags.replace(re, '');
        } else {
          input_tags = input_tags + that.options.inputSeparator + tag;
        }

        that._formatTags(input_tags);
      });
    },

    _drawDropdown: function(){
      if (this._dropdownWrapper){
        return;
      }

      this._dropdownWrapper = $('<div>', {
        'class': 'tagDropdownWrapper'
      });
      this._dropdownWrapper.css({
        width: this.$element.get(0).clientWidth,
        left: this.$element.position().left
      });

      this.$element.after(this._dropdownWrapper);

      var that = this;
      this._dropdownWrapper.on('click', 'div.tagList', function() {
        that.selectTag($(this));
      });
    },

    _drawTags: function() {
      var options = this.options,
          input_tags = this.$element.val(),
          separator_idx = input_tags.lastIndexOf(options.inputSeparator),
          search_str = '';

      search_str = $.trim(input_tags.substr(separator_idx + 1));
      if (search_str == '') {
        return this._dropdownWrapper.fadeOut(200);
      }

      if (this._search != '' && this._search == search_str) {
        return;
      }
      this._search = search_str;

      var tags = this._loadTags(options.forceReload);
      if (tags.length <= 0) {
        return;
      }

      var lists = [], i, tag, tag_name, idx, list
          search_len = this._search.length;
      for (i in tags) {
        tag = tags[i];
        tag_name = tag.name;

        match = tag_name.toLowerCase().indexOf(this._search) == 0;
        if (!options.autoFilter || match) {
          if (options.boldify && match && search_len > 0) {
            tag_name = '<b>' + tag_name.substring(0, search_len) + '</b>' + tag_name.substring(search_len);
          }

          list = '<div class="tagList"><div class="tagListTag">' + tag_name + '</div>';
          if (tag.weight) {
            list += '<div class="tagListWeight">' + tag.weight + '</div>';
          }
          list += '</div>'

          lists[lists.length] = list
        }
      }

      this._dropdownWrapper.empty().append(lists.join('')).fadeIn();
      this._dropdownWrapper.find('div:first').addClass('tagInputSel');
    },

    _formatTags: function (s) {
      var separator = this.options.inputSeparator,
          tags = s.split(separator),
          result = '', i, j, first = true;
      for (i = 0, j = tags.length; i < j; i++) {
        if ($.trim(tags[i]) != '') {
          if (first) {
            first = false;
            result = result + $.trim(tags[i]);
          } else {
            result = result + separator+ (separator==' ' ? '' : ' ') + $.trim(tags[i]);
          }
        }
      }

      this.$element.val(result);

      this._highlightSuggestionTags();
    },

    _highlightSuggestionTags: function () {
      if (!this._suggestionWrapper) {
        return;
      }

      var that = this,
          s = this.$element.val();
      this._suggestionWrapper.find('.tag').each(function(){
        var el = $(this),
            tag = el.text();

        if (that.containsTag(s, tag)) {
          el.addClass('selected');
        } else {
          el.removeClass('selected');
        }
      });
    },

    _onKeydown: function (evt){
      if (!this._dropdownWrapper){
        return;
      }

      var rows = this._dropdownWrapper.find('div.tagList'),
          rowNum = rows.index(this._dropdownWrapper.find('div.tagInputSel'));

      var ret = true;
      switch (evt.which){
        case 38: //up arrow
          rowNum = rowNum < 1 ? 0 : rowNum - 1;
          this.scrollTag(rows.eq(rowNum), true);
          break;

        case 40: //down arrow
          rowNum = rowNum < (rows.size() - 1) ? rowNum + 1 : rows.size() - 1;
          this.scrollTag(rows.eq(rowNum), false);
          break;

        case 9: //tab
        case 13: //enter
          if (this._dropdownWrapper.is(':visible')){
            ret = false;
            this.selectTag(rows.eq(rowNum));
          }
          break;

        case 27: //esc
          this._dropdownWrapper.fadeOut(200);
          break;

        default:
          this._drawTags();
          break;
      }

      return ret;
    }
  };

  $.fn.TagInput = function(options) {
    var data_name = 'plugin_' + PluginName;

    this.each(function(){
      if (!$.data(this, data_name)) {
        $.data(this, data_name, new TagInput(this, options));
      }
    });
  };
})(jQuery);
