import Mail from '../../lib/Mail';

class SendMail {
  get key() {
    return 'SendMail';
  }

  async handle({ data }) {
    const { deliveryman, recipient, product } = data;

    await Mail.sendMail({
      to: `${deliveryman.name} <${deliveryman.email}>`,
      subject: 'Cadastro de encomenda',
      template: 'orders',
      context: {
        deliveryman: deliveryman.name,
        recipient: recipient.dataValues,
        product,
      },
    });
  }
}

export default new SendMail();
