const fs = require('fs');
const path = require('path');
const {
  withDangerousMod,
  withAndroidManifest,
  withMainApplication,
  AndroidConfig,
  createRunOncePlugin,
} = require('@expo/config-plugins');

const WIDGET_KT_DIR = path.join(__dirname, 'templates', 'android', 'widget');
const RES_TEMPLATE = path.join(__dirname, 'templates', 'android', 'res');

function copyAndroidWidgetFiles(projectRoot) {
  const javaBase = path.join(
    projectRoot,
    'android',
    'app',
    'src',
    'main',
    'java',
    'com',
    'rairc',
    'mycalendarnote',
    'widget'
  );
  const resMain = path.join(projectRoot, 'android', 'app', 'src', 'main', 'res');
  const xmlDir = path.join(resMain, 'xml');

  if (!fs.existsSync(javaBase)) fs.mkdirSync(javaBase, { recursive: true });

  for (const f of fs.readdirSync(WIDGET_KT_DIR)) {
    if (f.endsWith('.kt')) {
      fs.copyFileSync(path.join(WIDGET_KT_DIR, f), path.join(javaBase, f));
    }
  }

  for (const sub of ['layout', 'xml', 'values', 'values-night', 'drawable']) {
    const src = path.join(RES_TEMPLATE, sub);
    const dest = path.join(resMain, sub);
    if (!fs.existsSync(src)) continue;
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const f of fs.readdirSync(src)) {
      fs.copyFileSync(path.join(src, f), path.join(dest, f));
    }
  }

  for (const legacy of [
    'MyCalendarWidgetCompact.java',
    'MyCalendarWidgetMedium.java',
    'MyCalendarHomeWidget.java',
    'MyCalendarWidgetCompact.kt',
    'MyCalendarWidgetMedium.kt',
  ]) {
    const p = path.join(javaBase, legacy);
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }

  for (const oldXml of [
    'widgetprovider_mycalendarwidgetcompact.xml',
    'widgetprovider_mycalendarwidgetmedium.xml',
    'widgetprovider_mycalendarhomewidget.xml',
    'widget_provider_compact.xml',
    'widget_provider_medium.xml',
  ]) {
    const p = path.join(xmlDir, oldXml);
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }
}

function withWidgetManifest(config) {
  return withAndroidManifest(config, async (cfg) => {
    const manifest = cfg.modResults;
    const app = AndroidConfig.Manifest.getMainApplicationOrThrow(manifest);

    if (app.service) {
      app.service = app.service.filter((s) => {
        const n = String(s.$['android:name'] || '');
        return (
          !n.includes('reactnativeandroidwidget') && !n.includes('RNWidgetCollection')
        );
      });
    }

    if (app.receiver) {
      app.receiver = app.receiver.filter((r) => {
        const n = String(r.$['android:name'] || '');
        if (n.includes('reactnativeandroidwidget')) return false;
        if (n === '.widget.MyCalendarHomeWidget') return false;
        if (n.endsWith('.widget.MyCalendarWidgetCompact')) return false;
        if (n.endsWith('.widget.MyCalendarWidgetMedium')) return false;
        if (n.endsWith('.widget.MyCalendarWidgetCompactLight')) return false;
        if (n.endsWith('.widget.MyCalendarWidgetCompactDark')) return false;
        if (n.endsWith('.widget.MyCalendarWidgetMediumLight')) return false;
        if (n.endsWith('.widget.MyCalendarWidgetMediumDark')) return false;
        return true;
      });
    } else {
      app.receiver = [];
    }

    app.receiver.push(
      {
        $: {
          'android:name': '.widget.MyCalendarWidgetCompactLight',
          'android:exported': 'false',
          'android:label': 'MyAgenda pequeno · claro',
        },
        'intent-filter': [
          {
            action: [
              { $: { 'android:name': 'android.appwidget.action.APPWIDGET_UPDATE' } },
            ],
          },
        ],
        'meta-data': [
          {
            $: {
              'android:name': 'android.appwidget.provider',
              'android:resource': '@xml/widget_provider_compact_light',
            },
          },
        ],
      },
      {
        $: {
          'android:name': '.widget.MyCalendarWidgetCompactDark',
          'android:exported': 'false',
          'android:label': 'MyAgenda pequeno · escuro',
        },
        'intent-filter': [
          {
            action: [
              { $: { 'android:name': 'android.appwidget.action.APPWIDGET_UPDATE' } },
            ],
          },
        ],
        'meta-data': [
          {
            $: {
              'android:name': 'android.appwidget.provider',
              'android:resource': '@xml/widget_provider_compact_dark',
            },
          },
        ],
      },
      {
        $: {
          'android:name': '.widget.MyCalendarWidgetMediumLight',
          'android:exported': 'false',
          'android:label': 'MyAgenda médio · claro',
        },
        'intent-filter': [
          {
            action: [
              { $: { 'android:name': 'android.appwidget.action.APPWIDGET_UPDATE' } },
            ],
          },
        ],
        'meta-data': [
          {
            $: {
              'android:name': 'android.appwidget.provider',
              'android:resource': '@xml/widget_provider_medium_light',
            },
          },
        ],
      },
      {
        $: {
          'android:name': '.widget.MyCalendarWidgetMediumDark',
          'android:exported': 'false',
          'android:label': 'MyAgenda médio · escuro',
        },
        'intent-filter': [
          {
            action: [
              { $: { 'android:name': 'android.appwidget.action.APPWIDGET_UPDATE' } },
            ],
          },
        ],
        'meta-data': [
          {
            $: {
              'android:name': 'android.appwidget.provider',
              'android:resource': '@xml/widget_provider_medium_dark',
            },
          },
        ],
      }
    );

    if (!app.service) app.service = [];
    app.service = app.service.filter(
      (s) => String(s.$['android:name'] || '') !== '.widget.AgendaRemoteViewsService'
    );
    app.service.push({
      $: {
        'android:name': '.widget.AgendaRemoteViewsService',
        'android:permission': 'android.permission.BIND_REMOTEVIEWS',
        'android:exported': 'false',
      },
    });

    // Wipe on uninstall / no silent restore on reinstall — restore only via Import JSON.
    app.$['android:allowBackup'] = 'false';
    app.$['android:fullBackupContent'] = '@xml/backup_rules';
    app.$['android:dataExtractionRules'] = '@xml/data_extraction_rules';

    return cfg;
  });
}

function withWidgetMainApplication(config) {
  return withMainApplication(config, (cfg) => {
    let contents = cfg.modResults.contents;
    if (!contents.includes('WidgetSyncPackage')) {
      contents = contents.replace(
        /PackageList\(this\)\.packages\.apply\s*\{/,
        `PackageList(this).packages.apply {
              add(com.rairc.mycalendarnote.widget.WidgetSyncPackage())`
      );
    }
    cfg.modResults.contents = contents;
    return cfg;
  });
}

function withCopyAndroidWidgetNative(config) {
  return withDangerousMod(config, [
    'android',
    async (cfg) => {
      copyAndroidWidgetFiles(cfg.modRequest.projectRoot);
      return cfg;
    },
  ]);
}

module.exports = createRunOncePlugin(
  function withMyCalendarAndroidWidget(config) {
    config = withCopyAndroidWidgetNative(config);
    config = withWidgetManifest(config);
    config = withWidgetMainApplication(config);
    return config;
  },
  'withMyCalendarAndroidWidget',
  '1.1.0'
);
