/*
 * Bittorrent Client using Qt and libtorrent.
 * Copyright (C) 2009  Christophe Dumez <chris@qbittorrent.org>
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * In addition, as a special exception, the copyright holders give permission to
 * link this program with the OpenSSL project's "OpenSSL" library (or with
 * modified versions of it that use the same license as the "OpenSSL" library),
 * and distribute the linked executables. You must obey the GNU General Public
 * License in all respects for all of the code used other than "OpenSSL".  If you
 * modify file(s), you may extend this exception to your version of the file(s),
 * but you are not obligated to do so. If you do not wish to do so, delete this
 * exception statement from your version.
 */

'use strict';

if (window.qBittorrent === undefined) {
    window.qBittorrent = {};
}

window.qBittorrent.PropGeneral = (function() {
    const exports = function() {
        return {
            updateData: updateData
        };
    };

    const clearData = function() {
        $('time_elapsed').set('html', '');
        $('eta').set('html', '');
        $('nb_connections').set('html', '');
        $('total_downloaded').set('html', '');
        $('total_uploaded').set('html', '');
        $('dl_speed').set('html', '');
        $('up_speed').set('html', '');
        $('dl_limit').set('html', '');
        $('up_limit').set('html', '');
        $('total_wasted').set('html', '');
        $('seeds').set('html', '');
        $('peers').set('html', '');
        $('share_ratio').set('html', '');
        $('reannounce').set('html', '');
        $('last_seen').set('html', '');
        $('total_size').set('html', '');
        $('pieces').set('html', '');
        $('created_by').set('html', '');
        $('addition_date').set('html', '');
        $('completion_date').set('html', '');
        $('creation_date').set('html', '');
        $('torrent_hash_v1').set('html', '');
        $('torrent_hash_v2').set('html', '');
        $('save_path').set('html', '');
        $('comment').set('html', '');

        const canvas = $('progress').getFirst('canvas');
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    };

    let loadTorrentDataTimer;
    const loadTorrentData = function() {
        if ($('prop_general').hasClass('invisible')
            || $('propertiesPanel_collapseToggle').hasClass('panel-expand')) {
            // Tab changed, don't do anything
            return;
        }
        const current_id = torrentsTable.getCurrentTorrentID();
        if (current_id === "") {
            clearData();
            clearTimeout(loadTorrentDataTimer);
            loadTorrentDataTimer = loadTorrentData.delay(5000);
            return;
        }
        const url = new URI('api/v2/torrents/properties?hash=' + current_id);
        new Request.JSON({
            url: url,
            noCache: true,
            method: 'get',
            onFailure: function() {
                $('error_div').set('html', 'QBT_TR(qBittorrent client is not reachable)QBT_TR[CONTEXT=HttpServer]');
                clearTimeout(loadTorrentDataTimer);
                loadTorrentDataTimer = loadTorrentData.delay(10000);
            },
            onSuccess: function(data) {
                $('error_div').set('html', '');
                if (data) {
                    let temp;
                    // Update Torrent data
                    if (data.seeding_time > 0)
                        temp = "QBT_TR(%1 (seeded for %2))QBT_TR[CONTEXT=PropertiesWidget]"
                        .replace("%1", window.qBittorrent.Misc.friendlyDuration(data.time_elapsed))
                        .replace("%2", window.qBittorrent.Misc.friendlyDuration(data.seeding_time));
                    else
                        temp = window.qBittorrent.Misc.friendlyDuration(data.time_elapsed);
                    $('time_elapsed').set('html', temp);

                    $('eta').set('html', window.qBittorrent.Misc.friendlyDuration(data.eta, window.qBittorrent.Misc.MAX_ETA));

                    temp = "QBT_TR(%1 (%2 max))QBT_TR[CONTEXT=PropertiesWidget]"
                        .replace("%1", data.nb_connections)
                        .replace("%2", data.nb_connections_limit < 0 ? "∞" : data.nb_connections_limit);
                    $('nb_connections').set('html', temp);

                    temp = "QBT_TR(%1 (%2 this session))QBT_TR[CONTEXT=PropertiesWidget]"
                        .replace("%1", window.qBittorrent.Misc.friendlyUnit(data.total_downloaded))
                        .replace("%2", window.qBittorrent.Misc.friendlyUnit(data.total_downloaded_session));
                    $('total_downloaded').set('html', temp);

                    temp = "QBT_TR(%1 (%2 this session))QBT_TR[CONTEXT=PropertiesWidget]"
                        .replace("%1", window.qBittorrent.Misc.friendlyUnit(data.total_uploaded))
                        .replace("%2", window.qBittorrent.Misc.friendlyUnit(data.total_uploaded_session));
                    $('total_uploaded').set('html', temp);

                    temp = "QBT_TR(%1 (%2 avg.))QBT_TR[CONTEXT=PropertiesWidget]"
                        .replace("%1", window.qBittorrent.Misc.friendlyUnit(data.dl_speed, true))
                        .replace("%2", window.qBittorrent.Misc.friendlyUnit(data.dl_speed_avg, true));
                    $('dl_speed').set('html', temp);

                    temp = "QBT_TR(%1 (%2 avg.))QBT_TR[CONTEXT=PropertiesWidget]"
                        .replace("%1", window.qBittorrent.Misc.friendlyUnit(data.up_speed, true))
                        .replace("%2", window.qBittorrent.Misc.friendlyUnit(data.up_speed_avg, true));
                    $('up_speed').set('html', temp);

                    temp = (data.dl_limit == -1 ? "∞" : window.qBittorrent.Misc.friendlyUnit(data.dl_limit, true));
                    $('dl_limit').set('html', temp);

                    temp = (data.up_limit == -1 ? "∞" : window.qBittorrent.Misc.friendlyUnit(data.up_limit, true));
                    $('up_limit').set('html', temp);

                    $('total_wasted').set('html', window.qBittorrent.Misc.friendlyUnit(data.total_wasted));

                    temp = "QBT_TR(%1 (%2 total))QBT_TR[CONTEXT=PropertiesWidget]"
                        .replace("%1", data.seeds)
                        .replace("%2", data.seeds_total);
                    $('seeds').set('html', temp);

                    temp = "QBT_TR(%1 (%2 total))QBT_TR[CONTEXT=PropertiesWidget]"
                        .replace("%1", data.peers)
                        .replace("%2", data.peers_total);
                    $('peers').set('html', temp);

                    $('share_ratio').set('html', data.share_ratio.toFixed(2));

                    $('reannounce').set('html', window.qBittorrent.Misc.friendlyDuration(data.reannounce));

                    if (data.last_seen != -1)
                        temp = new Date(data.last_seen * 1000).toLocaleString();
                    else
                        temp = "QBT_TR(Never)QBT_TR[CONTEXT=PropertiesWidget]";
                    $('last_seen').set('html', temp);

                    $('total_size').set('html', window.qBittorrent.Misc.friendlyUnit(data.total_size));

                    if (data.pieces_num != -1)
                        temp = "QBT_TR(%1 x %2 (have %3))QBT_TR[CONTEXT=PropertiesWidget]"
                        .replace("%1", data.pieces_num)
                        .replace("%2", window.qBittorrent.Misc.friendlyUnit(data.piece_size))
                        .replace("%3", data.pieces_have);
                    else
                        temp = "QBT_TR(Unknown)QBT_TR[CONTEXT=HttpServer]";
                    $('pieces').set('html', temp);

                    $('created_by').set('text', data.created_by);
                    if (data.addition_date != -1)
                        temp = new Date(data.addition_date * 1000).toLocaleString();
                    else
                        temp = "QBT_TR(Unknown)QBT_TR[CONTEXT=HttpServer]";

                    $('addition_date').set('html', temp);
                    if (data.completion_date != -1)
                        temp = new Date(data.completion_date * 1000).toLocaleString();
                    else
                        temp = "";

                    $('completion_date').set('html', temp);

                    if (data.creation_date != -1)
                        temp = new Date(data.creation_date * 1000).toLocaleString();
                    else
                        temp = "QBT_TR(Unknown)QBT_TR[CONTEXT=HttpServer]";
                    $('creation_date').set('html', temp);

                    if (data.infohash_v1 === "")
                        temp = "QBT_TR(N/A)QBT_TR[CONTEXT=PropertiesWidget]";
                    else
                        temp = data.infohash_v1;
                    $('torrent_hash_v1').set('html', temp);

                    if (data.infohash_v2 === "")
                        temp = "QBT_TR(N/A)QBT_TR[CONTEXT=PropertiesWidget]";
                    else
                        temp = data.infohash_v2;
                    $('torrent_hash_v2').set('html', temp);

                    $('save_path').set('html', data.save_path);

                    $('comment').set('html', window.qBittorrent.Misc.parseHtmlLinks(window.qBittorrent.Misc.escapeHtml(data.comment)));
                }
                else {
                    clearData();
                }
                clearTimeout(loadTorrentDataTimer);
                loadTorrentDataTimer = loadTorrentData.delay(5000);
            }
        }).send();

        const piecesUrl = new URI('api/v2/torrents/pieceStates?hash=' + current_id);
        new Request.JSON({
            url: piecesUrl,
            noCache: true,
            method: 'get',
            onFailure: function() {
                $('error_div').set('html', 'QBT_TR(qBittorrent client is not reachable)QBT_TR[CONTEXT=HttpServer]');
                clearTimeout(loadTorrentDataTimer);
                loadTorrentDataTimer = loadTorrentData.delay(10000);
            },
            onSuccess: function(data) {
                $('error_div').set('html', '');

                if (data) {
                    const canvas = $('progress').getFirst('canvas');
                    canvas.width = data.length;
                    const ctx = canvas.getContext('2d');
                    ctx.clearRect(0, 0, canvas.width, canvas.height);

                    // Group contiguous colors together and draw as a single rectangle
                    let color = '';
                    let rectWidth = 1;

                    for (let i = 0; i < data.length; ++i) {
                        const status = data[i];
                        let newColor = '';

                        if (status === 1)
                            newColor = '#44ffbe';
                        else if (status === 2)
                            newColor = '#8b1eff';

                        if (newColor === color) {
                            ++rectWidth;
                            continue;
                        }

                        if (color !== '') {
                            ctx.fillStyle = color;
                            ctx.fillRect((i - rectWidth), 0, rectWidth, canvas.height);
                        }

                        rectWidth = 1;
                        color = newColor;
                    }

                    // Fill a rect at the end of the canvas if one is needed
                    if (color !== '') {
                        ctx.fillStyle = color;
                        ctx.fillRect((data.length - rectWidth), 0, rectWidth, canvas.height);
                    }
                }
                else {
                    clearData();
                }
                clearTimeout(loadTorrentDataTimer);
                loadTorrentDataTimer = loadTorrentData.delay(5000);
            }
        }).send();
    };

    const updateData = function() {
        clearTimeout(loadTorrentDataTimer);
        loadTorrentData();
    };

    return exports();
})();

Object.freeze(window.qBittorrent.PropGeneral);
