const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ]
});

// ID رتبة الوسطاء
const mediatorsRoleId = '1434632109351506105';

client.once('ready', () => {
    console.log(`✅ تم تسجيل الدخول بنجاح بحساب: ${client.user.tag}`);
});

// 1️⃣ أول ما تكت تتفتح بـ Ticket Tool البوت هينزل اللوحة أوتوماتيك
client.on('channelCreate', async (channel) => {
    if (channel.type === ChannelType.GuildText && (channel.name.startsWith('ticket-') || channel.name.startsWith('تكت-'))) {
        setTimeout(async () => {
            try {
                const welcomeEmbed = new EmbedBuilder()
                    .setTitle('⚖️ تكت الوسيط')
                    .setDescription('اضغط على الزر أدناه لاستلام هذا التكت')
                    .setColor('#ED4245');

                const claimRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('claim_ticket_btn')
                        .setLabel('استلام تكت الوسيط 🛠️')
                        .setStyle(ButtonStyle.Primary)
                );

                await channel.send({ 
                    content: `<@&${mediatorsRoleId}>`, 
                    embeds: [welcomeEmbed], 
                    components: [claimRow] 
                });
            } catch (err) {
                console.log("خطأ في إرسال اللوحة:", err);
            }
        }, 1500);
    }
});

// 2️⃣ الاستجابة للأوامر النصية
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // أمر تنزيل اللوحة في أي قناة (.setup أو #setup أو !setup)
    if (message.content.trim() === '.setup' || message.content.trim() === '#setup' || message.content.trim() === '!setup') {
        const welcomeEmbed = new EmbedBuilder()
            .setTitle('⚖️ تكت الوسيط')
            .setDescription('اضغط على الزر أدناه لاستلام هذا التكت')
            .setColor('#ED4245');

        const claimRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('claim_ticket_btn')
                .setLabel('استلام تكت الوسيط 🛠️')
                .setStyle(ButtonStyle.Primary)
        );

        await message.channel.send({ 
            content: `<@&${mediatorsRoleId}>`, 
            embeds: [welcomeEmbed], 
            components: [claimRow] 
        });
    }

    // أمر الاستلام (#استلام أو +استلام)
    if (message.content.trim() === '#استلام' || message.content.trim() === '+استلام') {
        if (message.channel.name.startsWith('ticket-') || message.channel.name.startsWith('وساطة-')) {
            try {
                await message.channel.setName(`وساطة-${message.author.username}`);
            } catch (err) {}

            const claimEmbed = new EmbedBuilder()
                .setTitle('✅ تم استلام التكت')
                .setDescription(`تم استلام هذه التكت بنجاح بواسطة الوسيط: ${message.author}`)
                .setColor('#57F287');

            await message.channel.send({ embeds: [claimEmbed] });
        }
    }

    // أمر التخلي (#تخلي أو +تخلي)
    if (message.content.trim() === '#تخلي' || message.content.trim() === '+تخلي') {
        if (message.channel.name.startsWith('ticket-') || message.channel.name.startsWith('وساطة-')) {
            try {
                await message.channel.setName(`ticket-وساطة`);
            } catch (err) {}

            const unclaimEmbed = new EmbedBuilder()
                .setTitle('⚠️ تم التخلي عن التكت')
                .setDescription(`قام الوسيط ${message.author} بالتخلي عن التكت، وهي الآن متاحة لوسيط آخر.`)
                .setColor('#ED4245');

            const freshRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('claim_ticket_btn')
                    .setLabel('استلام التكت 🛠️')
                    .setStyle(ButtonStyle.Success)
            );

            await message.channel.send({ embeds: [unclaimEmbed], components: [freshRow] });
        }
    }

    // أمر القفل (#قفل أو +قفل أو #close)
    if (message.content.trim() === '#قفل' || message.content.trim() === '+قفل' || message.content.trim() === '#close') {
        if (message.channel.name.startsWith('ticket-') || message.channel.name.startsWith('وساطة-')) {
            const closeEmbed = new EmbedBuilder()
                .setTitle('🔒 إغلاق التكت')
                .setDescription('سيتم إغلاق هذه التكت وحذف الروم خلال 5 ثوانٍ...')
                .setColor('#ED4245');

            await message.channel.send({ embeds: [closeEmbed] });

            setTimeout(async () => {
                try {
                    await message.channel.delete();
                } catch (err) {}
            }, 5000);
        }
    }
});

// 3️⃣ التعامل مع زر الاستلام
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'claim_ticket_btn') {
        await interaction.deferUpdate();

        try {
            await interaction.channel.setName(`وساطة-${interaction.user.username}`);
        } catch (err) {}

        const disabledRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('claimed_done')
                .setLabel(`مستلم من طرف: ${interaction.user.username}`)
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true)
        );

        const claimEmbed = new EmbedBuilder()
            .setTitle('✅ تم استلام التكت')
            .setDescription(`تم استلام التكت بنجاح بواسطة الوسيط: ${interaction.user}`)
            .setColor('#57F287');

        try {
            await interaction.message.edit({ components: [disabledRow] });
        } catch (e) {}

        await interaction.channel.send({ embeds: [claimEmbed] });
    }
});

// التوكن بتاعك
client.login(process.env.TOKEN);