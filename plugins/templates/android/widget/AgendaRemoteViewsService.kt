package com.rairc.mycalendarnote.widget

import android.content.Intent
import android.widget.RemoteViewsService

class AgendaRemoteViewsService : RemoteViewsService() {
  override fun onGetViewFactory(intent: Intent): RemoteViewsFactory {
    return AgendaViewsFactory(applicationContext, intent)
  }

  companion object {
    const val EXTRA_COMPACT = "extra_compact"
    const val EXTRA_WIDGET_THEME = "extra_widget_theme"
  }
}
