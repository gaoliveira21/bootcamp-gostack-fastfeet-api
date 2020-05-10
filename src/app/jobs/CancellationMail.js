import Mail from '../../lib/Mail';

class CancellationMail {
  get key() {
    return 'CancellationMail';
  }

  async handle({ data }) {
    const { order, problem } = data;

    await Mail.sendMail({
      to: `${order.deliveryman.name} <${order.deliveryman.email}>`,
      subject: 'Entrega cancelada',
      template: 'cancellation',
      context: {
        deliveryman: order.deliveryman.name,
        product: order.product,
        recipient: order.recipient.dataValues,
        problem: problem.description,
      },
    });
  }
}

export default new CancellationMail();
