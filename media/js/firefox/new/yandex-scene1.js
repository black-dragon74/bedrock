/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

(function() {
    'use strict';

    var Yandex = {
        COUNTRY_CODE: ''
    };

    var _geoTimeout;
    var _requestComplete = false;

    Yandex.getLocation = function() {
        // should /country-code.json be slow to load,
        // just show the regular messaging after 3 seconds waiting.
        _geoTimeout = setTimeout(Yandex.updatePageContent, 3000);

        $.get('/country-code.json')
            .done(function(data) {
                if (data && data.country_code) {
                    Yandex.COUNTRY_CODE = data.country_code.toLowerCase();
                }
            })
            .fail(function() {
                // something went wrong, do nothing.
            })
            .always(function() {
                Yandex.updatePageContent();
            });
    };

    Yandex.verifyLocation = function(location) {
        var loc = location || window.location.search;
        // Dev can use ?geo=<country code> appended to the URL for easier testing.
        if (loc.indexOf('geo=') !== -1) {
            var urlRe = /geo=([a-z]{2})/i;
            var match = urlRe.exec(loc);
            if (match) {
                Yandex.COUNTRY_CODE = match[1].toLowerCase();
            }
        }

        return Yandex.COUNTRY_CODE === 'ru' ? true : false;
    };

    Yandex.updatePageContent = function() {
        clearTimeout(_geoTimeout);

        if (!_requestComplete) {
            _requestComplete = true;

            if (Yandex.shouldShowYandex()) {
                Yandex.updateMessaging();
            }

            Yandex.updateBrowserImage();
        }
    };

    Yandex.shouldShowYandex = function() {
        return Mozilla.Client.isDesktop && Yandex.verifyLocation();
    };

    Yandex.updateMessaging = function() {
        // Update page title and description.
        document.title = Mozilla.Utils.trans('pageTitle');
        document.querySelector('meta[name="description"]').setAttribute('content', Mozilla.Utils.trans('pageDesc'));

        // Add styling hook for Yandex specific CSS.
        document.body.classList.add('yandex');

        //Update doenload button CTA and link href.
        var button = document.querySelectorAll('.main-download .download-list .download-link[data-download-os="Desktop"]');

        for (var i = 0; i < button.length; i++) {
            button[i].href = Mozilla.Utils.trans('buttonLink');
            button[i].removeAttribute('data-direct-link');
            button[i].querySelector('.download-title').innerHTML = Mozilla.Utils.trans('buttonText');
        }

        // Update privacy policy text for Yandex.
        document.querySelector('.main-download .download-button .fx-privacy-link').innerHTML = Mozilla.Utils.trans('privacyNotice');

        // Update any elements with alt text translations.
        var elems = document.querySelectorAll('[data-yandex-alt]');

        for (var j = 0; j < elems.length; j++) {
            elems[j].innerText = elems[j].getAttribute('data-yandex-alt');
        }
    };

    Yandex.updateBrowserImage = function() {
        // Update header image
        var browser = document.querySelector('.header-image > img');

        if (Yandex.verifyLocation()) {
            browser.src = browser.getAttribute('data-yandex-src');
            browser.srcset = browser.getAttribute('data-yandex-srcset');
        } else {
            browser.src = browser.getAttribute('data-firefox-src');
            browser.srcset = browser.getAttribute('data-firefox-srcset');
        }
    };

    window.Mozilla.Yandex = Yandex;

    //TODO initialise this in a separate file
    Yandex.getLocation();

})();
