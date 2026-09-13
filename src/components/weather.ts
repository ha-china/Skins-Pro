import { html, nothing } from 'lit';
import type { TemplateResult } from 'lit';

import type { DashboardConfig, HomeAssistant, WeatherForecastDay } from '../types';
import { getWeatherDisplayText, getWeatherTemperature } from '../ha';

export function renderWeather(
  config: DashboardConfig,
  hass: HomeAssistant,
  forecast: WeatherForecastDay[] | undefined,
  onMoreInfo: (entityId: string) => void,
): TemplateResult {
  const entityId = config.weather?.entity || '';
  const condition = getWeatherDisplayText(hass, entityId);
  const temp = getWeatherTemperature(hass, entityId);

  if (!entityId) return html``;

  // The entity can vanish from hass.states (remove/reload) between renders —
  // never hand `undefined` to <ha-state-icon>.
  const stateObj = hass.states?.[entityId];

  const allForecast = forecast || [];
  const forecastSlice = allForecast.slice(0, 5);
  const today = allForecast[0];
  const locale = hass.locale?.language || hass.language || 'en';
  const weekdayFmt: Intl.DateTimeFormatOptions = { weekday: 'short' };

  const todayHigh = today?.temperature != null ? `${Math.round(Number(today.temperature))}°` : '';
  const todayLow = today?.templow != null ? `${Math.round(Number(today.templow))}°` : '';
  const todayPrecip = today?.precipitation != null ? `${Math.round(Number(today.precipitation))}mm` : '';

  return html`
    <div class="weather-block" @click=${() => onMoreInfo(entityId)}>
      <div class="weather-current">
        <div class="weather-state-icon">${stateObj
          ? html`<ha-state-icon .stateObj=${stateObj}></ha-state-icon>`
          : html`<ha-icon icon="mdi:weather-cloudy"></ha-icon>`}</div>
        <div class="weather-current-info">
          <div class="weather-current-temp">${temp || '--'}${todayHigh && todayLow ? html` <span class="weather-current-hl">${todayHigh}/${todayLow}</span>` : ''}</div>
          <div class="weather-current-cond">${condition}${todayPrecip ? html` · ${todayPrecip}` : ''}</div>
        </div>
      </div>
      ${forecastSlice.length > 0 ? html`
        <div class="weather-forecast">
          ${forecastSlice.map((day) => {
            const dt = day.datetime ? new Date(day.datetime) : null;
            const dayLabel = dt ? dt.toLocaleDateString(locale, weekdayFmt) : '';
            const high = day.temperature != null ? `${Math.round(Number(day.temperature))}°` : '--';
            const low = day.templow != null ? `${Math.round(Number(day.templow))}°` : '';
            return html`
              <div class="forecast-day">
                <div class="forecast-weekday">${dayLabel}</div>
                <div class="forecast-icon"><ha-state-icon .stateObj=${{ entity_id: 'weather._', state: day.condition || '', attributes: {} } as any}></ha-state-icon></div>
                <div class="forecast-temps"><span class="forecast-high">${high}</span><span class="forecast-low">${low}</span></div>
              </div>
            `;
          })}
        </div>
      ` : nothing}
    </div>
  `;
}
