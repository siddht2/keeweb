'use strict';

var Backbone = require('backbone'),
    Keys = require('../const/keys'),
    KeyHandler = require('../comp/key-handler'),
    GeneratorView = require('./generator-view'),
    UpdateModel = require('../models/update-model');

var FooterView = Backbone.View.extend({
    template: require('templates/footer.html'),

    events: {
        'click .footer__db-item': 'showFile',
        'click .footer__db-open': 'openFile',
        'click .footer__btn-view': 'switchView',
        'click .footer__btn-help': 'toggleHelp',
        'click .footer__btn-settings': 'toggleSettings',
        'click .footer__btn-generate': 'genPass',
        'click .footer__btn-lock': 'lockWorkspace'
    },

    initialize: function () {
        this.views = {};

        KeyHandler.onKey(Keys.DOM_VK_L, this.lockWorkspace, this, KeyHandler.SHORTCUT_ACTION);
        KeyHandler.onKey(Keys.DOM_VK_G, this.genPass, this, KeyHandler.SHORTCUT_ACTION);
        KeyHandler.onKey(Keys.DOM_VK_O, this.openFile, this, KeyHandler.SHORTCUT_ACTION);
        KeyHandler.onKey(Keys.DOM_VK_S, this.saveAll, this, KeyHandler.SHORTCUT_ACTION);
        KeyHandler.onKey(Keys.DOM_VK_COMMA, this.toggleSettings, this, KeyHandler.SHORTCUT_ACTION);

        this.listenTo(this.model.files, 'update reset change', this.render);
        this.listenTo(UpdateModel.instance, 'change:updateStatus', this.render);
    },

    render: function () {
        this.$el.html(this.template({
            files: this.model.files,
            updateAvailable: ['ready', 'found'].indexOf(UpdateModel.instance.get('updateStatus')) >= 0,
            visualLock: this.model.visualLock
        }));
        return this;
    },

    lockWorkspace: function() {
        if (this.model.visualLock) {
            return;
        }
        Backbone.trigger('lock-workspace');
    },

    genPass: function(e) {
        if (this.model.visualLock) {
            return;
        }
        e.stopPropagation();
        if (this.views.gen) {
            this.views.gen.remove();
            return;
        }
        var el = this.$el.find('.footer__btn-generate'),
            rect = el[0].getBoundingClientRect(),
            bodyRect = document.body.getBoundingClientRect(),
            right = bodyRect.right - rect.right,
            bottom = bodyRect.bottom - rect.top;
        var generator = new GeneratorView({ model: { copy: true, pos: { right: right, bottom: bottom } }}).render();
        generator.once('remove', (function() { delete this.views.gen; }).bind(this));
        this.views.gen = generator;
    },

    showFile: function(e) {
        if (this.model.visualLock) {
            return;
        }
        var fileId = $(e.target).closest('.footer__db-item').data('file-id');
        if (fileId) {
            Backbone.trigger('show-file', { fileId: fileId });
        }
    },

    openFile: function() {
        if (this.model.visualLock) {
            return;
        }
        Backbone.trigger('open-file');
    },

    saveAll: function() {
        if (this.model.visualLock) {
            return;
        }
        Backbone.trigger('save-all');
    },

    switchView: function() {
        if (this.model.visualLock) {
            return;
        }
        Backbone.trigger('switch-view');
    },

    toggleHelp: function() {
        if (this.model.visualLock) {
            return;
        }
        Backbone.trigger('toggle-settings', 'help');
    },

    toggleSettings: function() {
        if (this.model.visualLock) {
            return;
        }
        Backbone.trigger('toggle-settings', 'general');
    }
});

module.exports = FooterView;
