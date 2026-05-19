package com.rairc.mycalendarnote.widget

import android.appwidget.AppWidgetManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.RemoteViews
import android.widget.RemoteViewsService
import com.rairc.mycalendarnote.R
import android.app.PendingIntent

class AgendaViewsFactory(
  private val context: Context,
  intent: Intent,
) : RemoteViewsService.RemoteViewsFactory {

  private val appWidgetId =
    intent.getIntExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, AppWidgetManager.INVALID_APPWIDGET_ID)
  private val compact =
    intent.getBooleanExtra(AgendaRemoteViewsService.EXTRA_COMPACT, true)
  private val widgetTheme: String =
    intent.getStringExtra(AgendaRemoteViewsService.EXTRA_WIDGET_THEME) ?: "light"
  private var rows: List<WidgetRow> = emptyList()

  override fun onCreate() {}

  override fun onDataSetChanged() {
    val p = WidgetPayloadStore.readPayload(context) ?: run {
      rows = emptyList()
      return
    }
    val max = if (compact) p.maxRowsCompact else p.maxRowsMedium
    rows = p.rows.take(max)
  }

  override fun onDestroy() {}

  override fun getCount(): Int = rows.size

  override fun getViewAt(position: Int): RemoteViews {
    val r = rows[position]
    val rv = RemoteViews(context.packageName, R.layout.widget_list_item)
    val palette = WidgetPalettes.fromTheme(widgetTheme)
    rv.applyListItemPalette(palette)
    rv.setTextViewText(R.id.item_meta, r.meta)
    rv.setTextViewText(R.id.item_title, r.title)
    val clickIntent = Intent(Intent.ACTION_VIEW, Uri.parse(r.deepLink)).apply {
      addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
    }
    val pi = PendingIntent.getActivity(
      context,
      appWidgetId * 1000 + position,
      clickIntent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )
    rv.setOnClickPendingIntent(R.id.item_root, pi)
    return rv
  }

  override fun getLoadingView(): RemoteViews? = null

  override fun getViewTypeCount(): Int = 1

  override fun getItemId(position: Int): Long = position.toLong()

  override fun hasStableIds(): Boolean = true
}
