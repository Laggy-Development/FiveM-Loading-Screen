fx_version 'cerulean'
game 'gta5'

author 'LaggyDev'
description 'LaggyDev Roleplay Loading Screen'
version '1.0.0'

loadscreen 'html/index.html'
loadscreen_cursor 'yes'
loadscreen_manual_shutdown 'yes'

files {
    'html/index.html',
    'html/style.css',
    'html/script.js',
    'html/assets/**',
}

client_scripts {
    'client/client.lua',
}
