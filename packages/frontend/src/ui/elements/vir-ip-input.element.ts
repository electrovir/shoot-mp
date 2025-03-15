import {css, defineElement, defineElementEvent, html, listen, nothing} from 'element-vir';
import {isIPv4} from 'is-ip';
import {noNativeSpacing, ViraButton, ViraButtonStyle, ViraInput} from 'vira';

export const ipCacheKey = 'service-ip';

export const VirIpInput = defineElement<{
    ipAddress: string;
    errorMessage: string;
    connected: boolean;
}>()({
    tagName: 'vir-ip-input',
    styles: css`
        :host {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        p {
            ${noNativeSpacing}
        }

        .subtitle {
            font-size: 14px;
        }

        .error {
            color: red;
        }

        .success {
            color: green;
        }

        .static-ip {
            display: flex;
            align-items: center;
            gap: 8px;
        }
    `,
    events: {
        ipChange: defineElementEvent<string>(),
    },
    state() {
        return {
            isEditing: false,
            hasChangedValue: false,
        };
    },
    init({inputs, dispatch, events}) {
        dispatch(new events.ipChange(inputs.ipAddress));
    },
    render({state, updateState, events, dispatch, inputs}) {
        if (state.hasChangedValue && inputs.connected) {
            updateState({
                hasChangedValue: false,
                isEditing: false,
            });
        }

        const errorMessage: string = isIPv4(inputs.ipAddress)
            ? inputs.errorMessage || ''
            : 'Invalid IP address.';

        const successMessage: string = !errorMessage && inputs.connected ? 'Connected' : '';
        const isEditing = inputs.connected ? state.isEditing : true;

        const ipTemplate = isEditing
            ? html`
                  <${ViraInput.assign({
                      placeholder: 'Enter server LAN IP address',
                      value: inputs.ipAddress,
                  })}
                      ${listen(ViraInput.events.valueChange, (event) => {
                          const ipAddress = event.detail;

                          if (isIPv4(ipAddress)) {
                              dispatch(new events.ipChange(ipAddress));
                              window.localStorage.setItem(ipCacheKey, ipAddress);
                          }

                          updateState({hasChangedValue: true});
                      })}
                  ></${ViraInput}>
              `
            : html`
                  <div class="static-ip">
                      <p>${inputs.ipAddress}</p>
                      <${ViraButton.assign({
                          text: 'Edit',
                          buttonStyle: ViraButtonStyle.Outline,
                      })}
                          ${listen('click', () => {
                              updateState({
                                  isEditing: true,
                              });
                          })}
                      ></${ViraButton}>
                  </div>
              `;

        return html`
            ${ipTemplate}
            ${successMessage
                ? html`
                      <p class="subtitle success">${successMessage}</p>
                  `
                : errorMessage
                  ? html`
                        <p class="subtitle error">${errorMessage}</p>
                    `
                  : nothing}
        `;
    },
});
