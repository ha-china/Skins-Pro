import type { HomeAssistant } from '../types';

export async function setAlarmMode(
  element: HTMLElement,
  hass: HomeAssistant,
  entityId: string,
  service: string,
  isDisarm: boolean,
): Promise<void> {
  const stateObj = hass.states?.[entityId];
  if (!stateObj) return;

  const attrs = stateObj.attributes || {};
  const codeFormat = attrs.code_format as 'text' | 'number' | undefined;
  const codeArmRequired = attrs.code_arm_required !== false;

  const needsCode = isDisarm ? Boolean(codeFormat) : codeArmRequired;

  let code: string | undefined;

  if (needsCode) {
    const helpers = await (window as any).loadCardHelpers();
    const localize = (hass as any).localize;
    const title = localize
      ? localize(`ui.card.alarm_control_panel.${isDisarm ? 'disarm' : 'arm'}`)
      : (isDisarm ? 'Disarm' : 'Arm');
    const response = await helpers.showEnterCodeDialog(element, {
      codeFormat,
      title,
      submitText: title,
    });
    if (response == null) return;
    code = response;
  }

  await hass.callService('alarm_control_panel', service, {
    entity_id: entityId,
    code,
  });
}
