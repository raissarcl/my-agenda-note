package com.rairc.mycalendarnote.widget

import android.content.Context
import org.json.JSONObject
import java.io.File

data class WidgetNext(val meta: String, val title: String, val whenMs: Long)

data class WidgetRow(val meta: String, val title: String, val deepLink: String)

data class WidgetPayload(
  val phase: String,
  val brandTitle: String,
  val hintOnboardingTitle: String,
  val hintOnboardingBody: String,
  val hintEmpty: String,
  val monthTitle: String,
  val monthStats: String,
  val nextLabel: String,
  val next: WidgetNext?,
  val listHintCompact: String,
  val listHintMedium: String,
  val openAppUrl: String,
  val rows: List<WidgetRow>,
  val maxRowsCompact: Int,
  val maxRowsMedium: Int,
)

object WidgetPayloadStore {
  const val FILE_NAME = "mycalendar_widget_payload.json"
  const val PREFS = "mycalendar_widget"
  const val KEY_VARIANT = "list_variant"

  fun payloadFile(context: Context): File =
    File(context.filesDir, FILE_NAME)

  fun readPayload(context: Context): WidgetPayload? {
    val f = payloadFile(context)
    if (!f.exists() || f.length() == 0L) return null
    return try {
      parsePayload(f.readText(Charsets.UTF_8))
    } catch (_: Exception) {
      null
    }
  }

  fun parsePayload(json: String): WidgetPayload {
    val o = JSONObject(json)
    val nextObj = o.optJSONObject("next")
    val next = if (nextObj != null) {
      WidgetNext(
        nextObj.optString("meta", ""),
        nextObj.optString("title", ""),
        nextObj.optLong("whenMs", 0L)
      )
    } else null
    val rowsArr = o.optJSONArray("rows")
    val rows = mutableListOf<WidgetRow>()
    if (rowsArr != null) {
      for (i in 0 until rowsArr.length()) {
        val r = rowsArr.optJSONObject(i) ?: continue
        rows.add(
          WidgetRow(
            r.optString("meta", ""),
            r.optString("title", ""),
            r.optString("deepLink", "")
          )
        )
      }
    }
    return WidgetPayload(
      phase = o.optString("phase", "empty"),
      brandTitle = o.optString("brandTitle", "MyAgenda"),
      hintOnboardingTitle = o.optString("hintOnboardingTitle", "MyAgenda"),
      hintOnboardingBody = o.optString(
        "hintOnboardingBody",
        "Abra o app para ver a sua agenda."
      ),
      hintEmpty = o.optString("hintEmpty", ""),
      monthTitle = o.optString("monthTitle", ""),
      monthStats = o.optString("monthStats", ""),
      nextLabel = o.optString("nextLabel", "Próximo"),
      next = next,
      listHintCompact = o.optString("listHintCompact", ""),
      listHintMedium = o.optString("listHintMedium", ""),
      openAppUrl = o.optString("openAppUrl", "mycalendarnote://"),
      rows = rows,
      maxRowsCompact = o.optInt("maxRowsCompact", 12),
      maxRowsMedium = o.optInt("maxRowsMedium", 20),
    )
  }
}
