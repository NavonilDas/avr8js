import { CPU } from '../cpu/cpu';
import { u8 } from '../types';

/**
 * Analog to Digital Conversion
 *
 */
export class ADC {
  // Store Analog Values (Required While Reading)
  private analogvalues: any = {};
  // ADC Multiplexer Selection Register
  private readonly ADMUX: u8 = 0x7c;
  // ADC Control and Status Register A
  private readonly ADCSRA: u8 = 0x7a;

  // ADCL and ADCH –> The ADC Data Register
  private readonly ADCH: u8 = 0x79;
  private readonly ADCL: u8 = 0x78;

  /**
   * The ADC for a Microcontroller
   * @param cpu CPU
   */
  constructor(private cpu: CPU) {
    // Write Hook For Register ADCSRA
    cpu.writeHooks[this.ADCSRA] = (value) => {
      // if the ADSC (6th bit ) of ADCSRA is set ie. We need to start ADC Conversion
      if (value & (1 << 6)) {
        // Get Which pin needs analog read
        let pin = this.cpu.data[this.ADMUX];
        pin &= 0x0f;

        // Get the analog value for the respective pin if value is not present then retun a random 10 bit number
        // const analogValue = this.analogvalues[pin] || Math.floor(Math.random() * 1024);
        const analogValue =
          pin in this.analogvalues ? this.analogvalues[pin] : Math.floor(Math.random() * 1024);

        // Set analog value in the Data Register
        this.cpu.data[this.ADCL] = analogValue & 0xff;
        this.cpu.data[this.ADCH] = (analogValue >> 8) & 0x3;

        // Clear ADSC when Conversion is done
        this.cpu.data[this.ADCSRA] = value & ~(1 << 6);

        return true;
      }
    };
  }

  setAnalogValue(pin: number, value: number) {
    // Take 10 bit from the number and ignore other bits
    this.analogvalues[pin & 0x0f] = value & 0x3ff;
  }
}
