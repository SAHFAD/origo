/* ========================================================================
 * Copyright 2016 Mälardalskartan
 * Licensed under BSD 2-Clause (https://github.com/malardalskartan/mdk/blob/master/LICENSE.txt)
 * ======================================================================== */
 "use strict";

var $ = require('jquery');
var utils = require('./utils');
var editortoolbar = require('./editortoolbar');


module.exports = function() {

var $editorButton;

function bindUIActions() {
    $editorButton.on('click', function(e) {
        $('.o-map').trigger({
            type: 'enableInteraction',
            interaction: 'editor'
        });
        this.blur();
        e.preventDefault();
    });
}
function render() {
    var el = utils.createListButton({
        id: 'o-editor',
        iconCls: 'o-icon-fa-pencil',
        src: 'css/svg/fa-icons.svg#fa-pencil',
        text: 'Redigera'
    });
    $('#menutools').append(el);
}

return {
    init: function init(options) {
        render();
        $editorButton = $('#o-editor-button');
        bindUIActions();
        editortoolbar.init(options);
    }
}

}();