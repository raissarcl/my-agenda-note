package com.rairc.mycalendarnote.widget

import android.graphics.Color
import android.widget.RemoteViews
import androidx.annotation.ColorInt
import com.rairc.mycalendarnote.R

data class WidgetPalette(
  @ColorInt val bg: Int,
  @ColorInt val textPrimary: Int,
  @ColorInt val textSecondary: Int,
  @ColorInt val accent: Int,
  @ColorInt val itemFill: Int,
)

object WidgetPalettes {
  fun fromTheme(theme: String): WidgetPalette =
    if (theme == "dark") {
      WidgetPalette(
        bg = Color.parseColor("#0F172A"),
        textPrimary = Color.parseColor("#F1F5F9"),
        textSecondary = Color.parseColor("#94A3B8"),
        accent = Color.parseColor("#60A5FA"),
        itemFill = Color.parseColor("#1E293B"),
      )
    } else {
      WidgetPalette(
        bg = Color.parseColor("#EEF2F6"),
        textPrimary = Color.parseColor("#0F172A"),
        textSecondary = Color.parseColor("#64748B"),
        accent = Color.parseColor("#2563EB"),
        itemFill = Color.parseColor("#FFFFFF"),
      )
    }
}

fun RemoteViews.applyWidgetPalette(palette: WidgetPalette) {
  setInt(R.id.widget_root, "setBackgroundColor", palette.bg)
  setTextColor(R.id.brand, palette.textPrimary)
  setTextColor(R.id.month_title, palette.textPrimary)
  setTextColor(R.id.month_stats, palette.textSecondary)
  setTextColor(R.id.next_label, palette.textSecondary)
  setTextColor(R.id.next_meta, palette.accent)
  setTextColor(R.id.next_title, palette.textPrimary)
  setTextColor(R.id.list_hint, palette.textSecondary)
  setTextColor(R.id.empty_message, palette.textSecondary)
  setInt(R.id.widget_empty_block, "setBackgroundColor", palette.itemFill)
}

fun RemoteViews.applyListItemPalette(palette: WidgetPalette) {
  setInt(R.id.item_root, "setBackgroundColor", palette.itemFill)
  setTextColor(R.id.item_meta, palette.accent)
  setTextColor(R.id.item_title, palette.textPrimary)
}
